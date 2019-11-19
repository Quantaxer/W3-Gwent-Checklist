//Helper function to fill up the main table
function fillUpTable(list) {
    //First check if there are any rows to add to the table
    if (list.length == 0) {
        alert("No results found, please try again");
    }
    else {//Iterate through current table and remove all rows
        $('#tableOfCards').find("tr:gt(0)").remove();
        //Iterate through table and dynamically update the rows
        list.forEach(function(card) {
            $('#tableOfCards tbody').append(
                `<tr ${(card.OWNED === 1) ? "style='color:gray;font-style:italic'" : "style='color:black;font-style:normal'"}>
                    <td><input type=checkbox class='owned' ${(card.OWNED === 1) ? "checked" : ""}></td>
                    <td>${card.NAME}</td>
                    <td>${card.FACTION}</td>
                    <td>${card.STRENGTH}</td>
                    <td>${card.ABILITY}</td>
                    <td>${(card.HERO=== 1) ? "Yes" : "No"}</td>
                    <td>${card.ROWVAL}</td>
                    <td>${card.LOCATION}</td>
                    <td>${card.DESCRIPTION}</td>
                    <td>${card.EXPLANATION}</td>
                </tr>`
            );
        });
    }
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
                            //Populate the main table
                            fillUpTable(data2.initialTable);
                            updateTotalChecked();
                            //Hide the login screen and display the main program
                            $("#loginScreen").hide();
                            $("#checklistScreen").show();
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
        let row = $(this).closest("tr");
        let name = row.find("td:eq(1)").text();
        let faction = row.find("td:eq(2)").text();
        //Create the url for the image and set it
        let url = faction + '/' + name + '.png';
        $("#cardPic").attr('src', url);
        //Set all other information for the selected card
        document.getElementById('cardName').innerHTML = name;
        $("#selectedText").show();
        //Check if the person clicked on the checkbox
        if ((check === true)|| (check === false)) {
            //Get the name of the card to update the value
            $.ajax({
                type: 'get',
                url: '/updateOwned',
                data:({ownVal: check, nameVal: name}),
                success: function(data) {
                    updateTotalChecked();
                    if (check === true) {
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