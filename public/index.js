//Helper function to fill up the main table
function fillUpTable(list) {
    let i = 1;
    let table = document.getElementById('tableOfCards');

    //First check if there are any rows to add to the table
    if (list.length == 0) {
        alert("No results found, please try again");
    }
    else {//Iterate through current table and remove all rows
        for(let j = table.rows.length - 1; j > 0; j--){
            document.getElementById('tableOfCards').deleteRow(j);
        }
        //Iterate through table and dynamically update the rows
        list.forEach(function(card) {
            let row = table.insertRow(i);

            let cell = row.insertCell(0);
            let value = document.createElement("INPUT");
            if (card.OWNED == 1) {
                row.style.color = "gray";
                row.style.fontStyle = "italic";
            }
            else {
                row.style.color = "black";
                row.style.fontStyle = "normal";
            }
            value.type = "checkbox";
            value.checked = card.OWNED;
            value.className = "owned";
            cell.appendChild(value);

            let cell1 = row.insertCell(1);
            let value1 = document.createTextNode(card.NAME);
            cell1.appendChild(value1);

            let cell2 = row.insertCell(2);
            let value2 = document.createTextNode(card.FACTION);
            cell2.appendChild(value2);

            let cell3 = row.insertCell(3);
            let value3 = document.createTextNode(card.STRENGTH);
            cell3.appendChild(value3);

            let cell4 = row.insertCell(4);
            let value4 = document.createTextNode(card.ABILITY);
            cell4.appendChild(value4);

            let cell9 = row.insertCell(5);
            let hVal;
            if (card.HERO == 1) {
                hVal = "Yes";
            }
            else {
                hVal = "No";
            }
            let value9 = document.createTextNode(hVal);
            cell9.appendChild(value9);

            let cell5 = row.insertCell(6);
            let value5 = document.createTextNode(card.ROWVAL);
            cell5.appendChild(value5);

            let cell6 = row.insertCell(7);
            let value6 = document.createTextNode(card.LOCATION);
            cell6.appendChild(value6);

            let cell7 = row.insertCell(8);
            let value7 = document.createTextNode(card.DESCRIPTION);
            cell7.appendChild(value7);

            let cell8 = row.insertCell(9);
            let value8 = document.createTextNode(card.EXPLANATION);
            cell8.appendChild(value8);

            i++;
        });
    }
}

//Helper function to update the table after submitting a search parameter
function updateMainTable(faction) {
    $.ajax({
        type: 'get',
        url: '/sortTable',
        dataType: 'json',
        data: ({fact: faction}),
        success: function(data) {
            //Use results of the query to update the table
            fillUpTable(data);
        }
    });
}

function updateTotalChecked() {
    $.ajax({
        type: 'get',
        url: '/getTotalChecked',
        dataType: 'json',
        success: function(data) {
            document.getElementById('totalChecked').innerHTML = "Total cards owned: " + data.num + "/251";
        }
    });
}

let selectedRow;
let isSearch = -1;

//Main event listeners go here
$(document).ready(function() {
    //Runs when the user submits the database login form
	$("#dbLoginButton").click(function(event) {
        //Prevent the post request from refreshing
        event.preventDefault();
        $.ajax({
            type: 'post',
            url: '/connectToDB',
            dataType: 'html',
            //Send in the form data
            data: {username: $("#username").val(), pw: $("#pw").val(), dbName: $("#dbName").val(), host: $("#host").val()},
            success: function (data) {
                //Check if they were not able to connect to the database
                if (data == "badCreds") {
                    alert("Error connecting to the server, check credentials");
                }
                else {
                    //If it is connected, fill the tables up boiiiii
                    $.ajax({
                        type:'get',
                        url: 'fillTables',
                        dataType: 'json',
                        success: function(data2) {
                            for (let searchArray of data2.searchInfo) {
                                let selectName = Object.keys(searchArray[0])[0];
                                let selectHTML = document.getElementById(selectName);
                                selectName = '#' + selectName;
                                if (selectHTML !== null) {
                                    searchArray.unshift({selectName: "All"});
                                    for (let searchObject of searchArray) {
                                        $(selectName).append($('<option>' + Object.values(searchObject)[0] + '</option>'));
                                    }
                                }
                            }
                            //When the db if filled, populate the html table
                            $.ajax({
                                type: 'get',
                                url: '/populateInitialTable',
                                dataType: 'json',
                                success: function(data3) {
                                    //Populate the main table
                                    fillUpTable(data3);
                                    updateTotalChecked();
                                    //Hide the login screen and display the main program
                                    $("#loginScreen").hide();
                                    $("#checklistScreen").show();
                                }
                            });
                        }
                    });
                }
            }
        });
    });

    //Update database when a row was checked
    $(document).on("click", "#tableOfCards tr td", function(e) {
        //Get the checkbox value
        let check = this.firstChild.checked;
        //Get the information for the selected card
        let name = document.getElementById('tableOfCards').rows[this.parentElement.rowIndex].cells[1].firstChild.data;
        let faction = document.getElementById('tableOfCards').rows[this.parentElement.rowIndex].cells[2].firstChild.data;
        let strength = document.getElementById('tableOfCards').rows[this.parentElement.rowIndex].cells[3].firstChild.data;
        let ability = document.getElementById('tableOfCards').rows[this.parentElement.rowIndex].cells[4].firstChild.data;
        let row = document.getElementById('tableOfCards').rows[this.parentElement.rowIndex].cells[5].firstChild.data;
        let tableRow = this.parentElement;
        //Create the url for the image and set it
        let url = faction + '/' + name + '.png';
        $("#cardPic").attr('src', url);
        //Set all other information for the selected card
        document.getElementById('cardName').innerHTML = name;
        $("#selectedText").show();
        //Check if the person clicked on the checkbox
        if ((check == true)|| (check == false)) {
            //Get the name of the card to update the value
            $.ajax({
                type: 'get',
                url: '/updateOwned',
                data:({ownVal: check, nameVal: name}),
                success: function(data) {
                    updateTotalChecked();
                    if (check == true) {
                        tableRow.style.color = "gray";
                        tableRow.style.fontStyle = "italic";
                    }
                    else {
                        tableRow.style.color = "black";
                        tableRow.style.fontStyle = "normal";
                    }
                }
            });
        }
    });

    $("#searchButton").click(function(event) {
        event.preventDefault();
        $.ajax({
            type: 'post',
            url: '/advancedSearch',
            dataType: 'html',
            data: {
                n: $('#nameToSearch').val(), 
                f: $("#FACTION").val(), 
                s: $("#STRENGTH").val(), 
                r: $("#ROWVAL").val(), 
                o:$("#OWNED").val(), 
                h: $("#HERO").val(), 
                a: $("#ABILITY").val()
            },
            success: function (data) {
                result = JSON.parse(data);
                fillUpTable(result);
            }
        });
    });

    $("#searchBtn").click(function(event) {
        if (isSearch < 0) {
            document.getElementById("squareBG1").style.left = "20%";
            document.getElementById("searchMenu").style.width = "19%";
            $("#searchMenu").show();
        }
        else {
            document.getElementById("squareBG1").style.left = "10%";
            document.getElementById("searchMenu").style.width = "0%";
            $("#searchMenu").hide();
        }
        isSearch = isSearch * -1;
    });
});