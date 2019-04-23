import sys, json
#card object
class Card(object):
def __init__(self, faction, name, strength, row, ability, location, primaryInfo, secondaryInfo):
	self.faction = faction
	self.name = name
	self.strength = strength
	self.row = row
	self.ability = ability
	self.location = location
	self.primaryInfo = primaryInfo
	self.secondaryInfo = secondaryInfo

#Main program
if __name__ == "__main__":
	listOfCards = []

	f = open("Assets/card_info.csv", "r")
	#Loop through the file
	for line in f:
		info = line.split(',')
		#Get all the info from the line and add it to the lsit of objects
		newCard = Card(info[0], info[1], info[2], info[3], info[4], info[5], info[6], info[7])
		listOfCards.append(newCard)

	#stringify the list of objects and return
	returnString = json.dumps([ob.__dict__ for ob in listOfCards])

	f.close()
	print (returnString)