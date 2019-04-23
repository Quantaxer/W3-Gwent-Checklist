$(document).ready(function() {
	//Runs as soon as the page is loaded: runs the python script and gets all the card info from the .csv file
	$.ajax({
		type: 'get',            
        dataType: 'json',
        url: '/getCardInfo',
        success: function (data) {
        	console.log(data);
        }
	});
});