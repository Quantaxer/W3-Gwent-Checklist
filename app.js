'use strict'

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

// Important, pass in port as in `npm run dev 1234`, do not change
const portNum = process.argv[2];

// Send HTML at root, do not change
app.get('/',function(req,res){
  	res.sendFile(path.join(__dirname+'/public/index.html'));
});

// Send Style, do not change
app.get('/style.css',function(req,res){
 	//Feel free to change the contents of style.css to prettify your Web app
  	res.sendFile(path.join(__dirname+'/public/style.css'));
});

// Send obfuscated JS, do not change
app.get('/index.js',function(req,res){
  	fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
	    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
	    res.contentType('application/javascript');
	    res.send(minimizedContents._obfuscatedCode);
	});
});

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

let userN;
let pass;
let name;
let host;

let connection = null;

app.post('/fillTables', function(req, res) {
	userN = req.body.username;
	pass = req.body.pw;
	name = req.body.dbName;
	host = req.body.host;
	let isErr;
	connection = mysql.createConnection({
		host: host,
		user: userN,
		password: pass,
		database: name
	});
	connection.connect(function(err) {
		if (err) {
			isErr = "badCreds";
		}
		else {
			let script = new PythonShell('scripts/infoToJSON.py');
			script.on('message', function(message) {
				//Send the JSON to the frontend
				connection.query("CREATE TABLE IF NOT EXISTS CARDS (NAME VARCHAR(512) PRIMARY KEY NOT NULL, FACTION VARCHAR(100) NOT NULL, STRENGTH INT NOT NULL, ROWVAL VARCHAR(60) NOT NULL, ABILITY VARCHAR(256) NOT NULL, LOCATION VARCHAR(100) NOT NULL, DESCRIPTION VARCHAR(256) NOT NULL, EXPLANATION VARCHAR(512))", function(err, rows, fields) {
					if (err) {
						isErr = "badSQL";
					}
					else {
						let cardList = JSON.parse(message);
						cardList.forEach(function(card) {
							connection.query("INSERT INTO CARDS (NAME, FACTION, STRENGTH, ROWVAL, ABILITY, LOCATION, DESCRIPTION, EXPLANATION) VALUES ('" + card.name + "', '" + card.faction + "'," + card.strength + ", '" + card.row + "', '" + card.ability + "','" + card.location + "', '" + card.primaryInfo + "','" + card.secondaryInfo + "')", function(err, results) {
								if (err) {
									isErr = "badSQL";
									console.log("INSERT INTO CARDS (NAME, FACTION, STRENGTH, ROWVAL, ABILITY, LOCATION, DESCRIPTION, EXPLANATION) VALUES ('" + card.name + "', '" + card.faction + "'," + card.strength + ", '" + card.row + "', '" + card.ability + "','" + card.location + "', '" + card.primaryInfo + "','" + card.secondaryInfo + "')");
								}
								else {
									isErr = "good";
									console.log(card.name);
								}
							});
						});
					}
				});
			});
		}
		if (isErr == "good") {
			res.send("good");
		}
		else if (isErr == "badCreds") {
			res.send("badCred");
		}
		else if (isErr == "badSQL"){
			res.send("badSQL");
		}
	});
});