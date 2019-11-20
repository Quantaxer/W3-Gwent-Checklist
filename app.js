'use strict'

//Dependencies
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');
const {PythonShell} = require('python-shell');
const mysql = require('promise-mysql');
const bodyParse = require('body-parser');
app.use(bodyParse.urlencoded({extended: true}));
app.use(fileUpload());

// Minimization
const fs = require('fs-extra');
const JavaScriptObfuscator = require('javascript-obfuscator');

//Pass in port as in `npm run dev 1234`
const portNum = 38008;

//Send HTML at root
app.get('/',function(req,res){
  	res.sendFile(path.join(__dirname+'/public/index.html'));
});

//Send Style
app.get('/style.css',function(req,res){
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

//Code for the path of the images in Assets
var publicDir = path.join(__dirname,'/Assets');
app.use(express.static(publicDir));

//Run at the specified port
app.listen(portNum);
console.log('Running app at localhost: ' + portNum);

//Global variables for the user's database connection
let connection = null;

//async function which runs when the user presses connect to the database
app.post('/connectToDB', async function(req, res) {
	//Create connection object
	let connectionOptions = {
		host: req.body.host,
		user: req.body.username,
		password: req.body.pw,
		database: req.body.dbName
	};
	//Connect to the database
	connection = await mysql.createConnection(connectionOptions);
	res.send("done");
});

//Function that runs after the user connected to the database to fill the tables
app.get('/fillTables', async function(req, res) {
	let columnVals = ['FACTION', 'STRENGTH', 'ROWVAL','ABILITY', 'LOCATION', 'OWNED','HERO', 'DESCRIPTION','EXPLANATION'];
	//Get the JSON of card information
	let script = new PythonShell('scripts/infoToJSON.py');
	script.on('message', async function(message) {
		//Create the table of cards, but only if it isn't already there
		try {
			let createTableQuery = `CREATE TABLE IF NOT EXISTS CARDS (
				NAME VARCHAR(512) PRIMARY KEY NOT NULL, 
				FACTION VARCHAR(100) NOT NULL, 
				STRENGTH INT NOT NULL, 
				ROWVAL VARCHAR(60) NOT NULL, 
				ABILITY VARCHAR(256) NOT NULL, 
				LOCATION VARCHAR(100) NOT NULL, 
				OWNED BOOLEAN NOT NULL, 
				HERO BOOLEAN NOT NULL, 
				DESCRIPTION VARCHAR(256) NOT NULL, 
				EXPLANATION VARCHAR(512))`;

			let isTableCreated = await connection.query(createTableQuery);
			if (isTableCreated.affectedRows !== 0) {
				let cardList = JSON.parse(message);
				//Iterate through the lsit of cards, and add each one to the database
				for (let card of cardList) {
					let insertToTableQuery = `INSERT INTO CARDS (NAME, FACTION, STRENGTH, ROWVAL, ABILITY, LOCATION, OWNED, HERO, DESCRIPTION, EXPLANATION) 
												VALUES ('${card.name}','${card.faction}',${card.strength},'${card.row}','${card.ability}','${card.location}
												','${card.owned}','${card.hero}','${card.primaryInfo}','${card.secondaryInfo}')`;

					await connection.query(insertToTableQuery);
				};
			}
			let resultsArr = [];
			for (let columnName of columnVals) {
				resultsArr.push(await connection.query(`select ${columnName} from cards group by ${columnName}`));
			}

			let initialTableResults = await connection.query(`SELECT * FROM CARDS ORDER BY FACTION, NAME`);
			//Tell the front end it is finished
			res.send({searchInfo: resultsArr, initialTable: initialTableResults});
		}
		catch(e) {
			console.error("Error creating table: " + e);
		}
	});
});

//Query to update a row in the db if the userclicks a checkbox
app.get('/updateOwned', async function(req, res) {
	let newOwned = req.query.ownVal;
	let name = req.query.nameVal;
	try {
		await connection.query(`UPDATE CARDS SET OWNED = ${newOwned} WHERE NAME = '${name}'`);
		res.send({g: "g"});
	}
	catch(e) {
		console.error("Error updating table: " + e);
	}
});

//Function for the advanced search parameters
app.post('/advancedSearch', async function(req, res) {
	//Default values set to null
	for (let bodyObject of Object.entries(req.body)) {
		if (bodyObject[1] === "All") {
			req.body[bodyObject[0]] = null;
		}
	}
	//Get info for optional queries
	let faction = req.body.f;
	let strength = req.body.s;
	let row = req.body.r;
	let owned = req.body.o;
	let hero = req.body.h;
	let ability = req.body.a;
	let name = req.body.n;
	//Execute query where you have multiple optional parameters
	try {
		let rows = await connection.query(`SELECT * FROM CARDS WHERE (name like '%${name}%') AND (? IS NULL OR FACTION = ?) AND (? IS NULL OR STRENGTH = ?)
											AND (? IS NULL OR ROWVAL = ?) AND (? IS NULL OR OWNED = ?) AND (? IS NULL OR HERO = ?) 
											AND (? IS NULL OR ABILITY = ?)`, 
											[faction, faction, strength, strength, row, row, owned, owned, hero, hero, ability, ability]);
									
		res.send(rows);
	}
	catch(e) {
		console.error(e);
	}
});