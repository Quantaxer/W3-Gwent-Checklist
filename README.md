# W3-Gwent-Checklist
A little web-based project for the Gwent minigame in The Witcher 3 in order to display full stack web development with Node JS and the express framework, mysql queries, and python scripts.

## About this program
This application is meant to be a tracker for all the collectible cards in The Witcher 3's minigame Gwent. It is both an encyclopedia of every card in the game, as well as a checklist someone can use to determine which cards they are missing. Each card contains information about it that a player should know, including its abilities, strength, and where the card can be obtained. Someone can search through this collection to find information about a certain card they want to know about. They can also view the information about a specific card, as well as its picture. 

There is also an integrated deck builder, which has all the rules as the one in the game. This can be helpful to create your own deck with both your current cards, or with cards you do not own. You can also save a deck list to the server, and it will load it back up once you reopen the program.

## Things needed to run this program
This program is a web application that is not hosted on another server right now, as such it requires a few things to run.
- Node JS
- npm
- Python 3.7
- A mysql server
  - Make sure to create a database in mysql (for example, in mysql run create database Gwent).
  - Host name should be "localhost" unless specified
  - May or may not be password protected
  - Example: mysql -u root -> create database Gwent; credentials are username = root, no password, database name = Gwent, host name = localhost

## How to run this program
1. In the folder where the packages.json file is, run "npm install"
2. Run the command "npm run dev (portNum)", where portNum is a number on the port that the server is run on
3. Go to your web browser and go to the address "localhost:portNum"
4. Log into the database using your credentials.
5. Begin using the website!