$(document).ready(function() {
	//Runs as soon as the page is loaded: runs the python script and gets all the card info from the .csv file
	/*$.ajax({
		type: 'get',            
        dataType: 'json',
        url: '/getCardInfo',
        success: function (data) {
        	console.log(data);
        }
	});*/
	$("#dbLoginButton").click(function(event) {
        event.preventDefault();
        $.ajax({
            type: 'post',
            url: '/connectToDB',
            dataType: 'html',
            data: {username: $("#username").val(), pw: $("#pw").val(), dbName: $("#dbName").val(), host: $("#host").val()},
            success: function (data) {
                $.ajax({
                    type:'get',
                    url: 'fillTables',
                    dataType: 'json',
                    success: function(data2) {
                        $("#dbCreds").hide();
                        $("#search").show();
                    }
                });

            }
        });
    });

    $("#searchFor").click(function(event) {
        console.log($("#nameToSearch").val());
        event.preventDefault();
         $.ajax({
            type: 'post',
            url: '/searchName',
            dataType: 'html',
            data: {name: $("#nameToSearch").val()},
            success: function (data) {
                console.log(data);
            }
        });

    });
});