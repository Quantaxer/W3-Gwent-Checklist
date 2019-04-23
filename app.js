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

app.post('/connectToDB', function(req, res) {
	let isErr;
	userN = req.body.username;
	pass = req.body.pw;
	name = req.body.dbName;
	host = req.body.host;
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
			isErr = "good";
		}
		res.send(isErr);
	});
});

app.get('/fillTables', function(req, res) {
	let script = new PythonShell('scripts/infoToJSON.py');
	script.on('message', function(message) {
		//Send the JSON to the frontend
		connection.query("CREATE TABLE IF NOT EXISTS CARDS (NAME VARCHAR(512) PRIMARY KEY NOT NULL, FACTION VARCHAR(100) NOT NULL, STRENGTH INT NOT NULL, ROWVAL VARCHAR(60) NOT NULL, ABILITY VARCHAR(256) NOT NULL, LOCATION VARCHAR(100) NOT NULL, OWNED BOOLEAN NOT NULL, DESCRIPTION VARCHAR(256) NOT NULL, EXPLANATION VARCHAR(512))", function(err, rows, fields) {
			if (!err) {
				let cardList = JSON.parse(message);
				cardList.forEach(function(card) {
					connection.query("INSERT INTO CARDS (NAME, FACTION, STRENGTH, ROWVAL, ABILITY, LOCATION, OWNED, DESCRIPTION, EXPLANATION) VALUES ('" + card.name + "', '" + card.faction + "'," + card.strength + ", '" + card.row + "', '" + card.ability + "','" + card.location + "', '" + card.owned + "', '" + card.primaryInfo + "','" + card.secondaryInfo + "')", function(err, results) {
						if (err) {
							console.log("B");
						}
					});
				});
				res.send({done: "good"});
			}
		});
	});
});

app.post('/searchName', function(req, res) {
	let val = req.body.name;
	console.log("SELECT * FROM CARDS WHERE (name = '" + val + "')");

	connection.query("SELECT * FROM CARDS WHERE (name = '" + val + "')", function(err, rows, fields) {
		if (err) {
			res.send({err: "nothing found"});
		}
		else {
			res.send({err: rows});
		}
	});
});