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
            url: '/fillTables',
            dataType: 'html',
            data: {username: $("#username").val(), pw: $("#pw").val(), dbName: $("#dbName").val(), host: $("#host").val()},
            success: function (data) {
            	console.log("done");
            }
        });
    });
});