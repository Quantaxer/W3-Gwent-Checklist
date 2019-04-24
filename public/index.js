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
                            //When all the tables have filled, remove the login screen and show the main screen
                            $("#loginScreen").hide();
                            $("#checklistScreen").show();
                        }
                    });
                }
            }
        });
    });

    //Function for the search bar
    $("#searchFor").click(function(event) {
        //Prevent the post from refreshing
        event.preventDefault();

         $.ajax({
            type: 'post',
            url: '/searchName',
            dataType: 'html',
            //Send in the form data
            data: {name: $("#nameToSearch").val()},
            success: function (data) {
                //TODO: do stuff with results
                console.log(data);
            }
        });

    });
});