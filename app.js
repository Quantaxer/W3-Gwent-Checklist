'use strict'

//Dependencies
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');
const {PythonShell} = require('python-shell');
const mysql = require('mysql');
const bodyParse = require('body-parser');
app.use(bodyParse.urlencoded({extended: true}));
app.use(fileUpload());

// Minimization
const fs = require('fs-extra');
const JavaScriptObfuscator = require('javascript-obfuscator');

//Pass in port as in `npm run dev 1234`
const portNum = process.argv[2];

//Send HTML at root
app.get('/',function(req,res){
  	res.sendFile(path.join(__dirname+'/public/index.html'));
});

//Send Style
app.get('/style.css',function(req,res){
 	//Feel free to change the contents of style.css to prettify your Web app
  	res.sendFile(path.join(__dirname+'/public/style.css'));
});

//Send obfuscated JS
app.get('/index.js',function(req,res){
  	fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
	    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
	    res.contentType('application/javascript');
	    res.send(minimizedContents._obfuscatedCode);
	});
});

//Run at the specified port
app.listen(portNum);
console.log('Running app at localhost: ' + portNum);


//Run the python script to get a JSON of all cards in the file
app.get('/getCardInfo', function(req, res) {
	var script = new PythonShell('scripts/infoToJSON.py');
	script.on('message', function(message) {
		//Send the JSON to the frontend
		res.send({x:message});
	});
});

//Global variables for the user's database connection
let userN;
let pass;
let name;
let host;
let connection = null;

//async function which runs when the user presses connect to the database
app.post('/connectToDB', function(req, res) {
	let isErr;
	//Get user input
	userN = req.body.username;
	pass = req.body.pw;
	name = req.body.dbName;
	host = req.body.host;
	//Create connection object
	connection = mysql.createConnection({
		host: host,
		user: userN,
		password: pass,
		database: name
	});
	//Connect to the database
	connection.connect(function(err) {
		//Check if the credentials are good. If not return
		if (err) {
			isErr = "badCreds";
		}
		else {
			isErr = "good";
		}
		res.send(isErr);
	});
});

//Function that runs after the user connected to the database to fill the tables
app.get('/fillTables', function(req, res) {
	//Get the JSON of card information
	let script = new PythonShell('scripts/infoToJSON.py');
	script.on('message', function(message) {
		//Create the table of cards, but only if it isn't already there
		connection.query("CREATE TABLE IF NOT EXISTS CARDS (NAME VARCHAR(512) PRIMARY KEY NOT NULL, FACTION VARCHAR(100) NOT NULL, STRENGTH INT NOT NULL, ROWVAL VARCHAR(60) NOT NULL, ABILITY VARCHAR(256) NOT NULL, LOCATION VARCHAR(100) NOT NULL, OWNED BOOLEAN NOT NULL, DESCRIPTION VARCHAR(256) NOT NULL, EXPLANATION VARCHAR(512))", function(err, rows, fields) {
			if (!err) {
				let cardList = JSON.parse(message);
				//Iterate through the lsit of cards, and add each one to the database
				cardList.forEach(function(card) {
					connection.query("INSERT INTO CARDS (NAME, FACTION, STRENGTH, ROWVAL, ABILITY, LOCATION, OWNED, DESCRIPTION, EXPLANATION) VALUES ('" + card.name + "', '" + card.faction + "'," + card.strength + ", '" + card.row + "', '" + card.ability + "','" + card.location + "', '" + card.owned + "', '" + card.primaryInfo + "','" + card.secondaryInfo + "')", function(err, results) {
						
					});
				});
				//Tell the front end it is finished
				res.send({done: "good"});
			}
		});
	});
});

//Query to populate the table upon logging in
app.get('/populateInitialTable', function(req, res) {
	connection.query("SELECT * FROM CARDS ORDER BY FACTION, NAME", function(err, rows, fields) {
		if (err) {
			console.log("aww heck");
		}
		else {
			res.send(rows);
		}
	});
});

//Query to update a row in the db if the userclicks a checkbox
app.get('/updateOwned', function(req, res) {
	let newOwned = req.query.ownVal;
	let name = req.query.nameVal;
	connection.query("UPDATE CARDS SET OWNED = " + newOwned + " WHERE NAME = '" + name + "'", function(err, results) {
		if (err) {
			console.log("UPDATE CARDS SET OWNED = " + newOwned + " WHERE NAME = '" + name + "'");
		}
	});
});

app.get('/sortTable', function(req, res) {
	let faction = req.query.fact;
	if (faction == "all") {
		//Query gets the specific card
		connection.query("SELECT * FROM CARDS ORDER BY FACTION, NAME", function(err, rows, fields) {
			//Return the row if it exists in the database
			if (err) {
				res.send({err: "nothing found"});
			}
			else {
				res.send(rows);
			}
		});
	}
	else {
		connection.query("SELECT * FROM CARDS WHERE (FACTION = '" + faction + "') ORDER BY NAME", function(err, rows, fields) {
			if (err) {
				console.log("SELECT * FROM CARDS WHERE (FACTION = '" + faction + "') ORDER BY NAME");
			}
			else {
				res.send(rows);
			}
		});
	}
});

//Function that runs when the user searches for a certain card by the name
app.post('/searchName', function(req, res) {
	let val = req.body.name;
	//Query gets the specific card
	connection.query("SELECT * FROM CARDS WHERE (name = '" + val + "')", function(err, rows, fields) {
		//Return the row if it exists in the database
		if (err) {
			res.send({err: "nothing found"});
		}
		else {
			res.send(rows);
		}
	});
});