# CaveGameTracker
Cave Game Tracker tracks your coordinates and generates a map of recent moves while playing Wolf Game's Cave Game.

<p float="center">
<img src="https://github.com/0xbigfooot/CaveGameTracker/blob/main/images/MapView.png" width="400" height="600">
<img src="https://github.com/0xbigfooot/CaveGameTracker/blob/main/images/CoordinatesView.png" width="400" height="600">
 </p>
 
Your path will show up green if you walked on coordinates you haven't walked on before, yellow if you've stepped on those coordinates once before, and red if you've stepped on those coordinates more than once before.
 
 Switch between Map View and Coordinates View by clicking on the Page button in the top left corner.
 
 Cave Game Tracker also allows you to export your coordinates to CSV form by clicking the Download button on the coordinates view window. 

Installation
-------------
1. Click the green "Code" button at the top of the page.

![Download Button](https://github.com/0xbigfooot/CaveGameTracker/blob/main/images/GreenCode.png)

2. Click "Download ZIP"
3. Decompress the ZIP file by double clicking it. Remember the directory that you save it to.
4. Open chrome://extensions in your Chrome browser (also works in Brave).

![ExtensionsHomePage](https://github.com/0xbigfooot/CaveGameTracker/blob/main/images/ExtensionsHome.png)

5. Turn the "Developer Mode" switch on in the top right corner of the browser.
6. Click "Load Unpacked" in the top left corner.
7. Select the folder that you just decompressed. (Named "CaveGameTracker-main" by default.)
8. Success! You can now access the extension from the puzzle piece in the top right of your browser. You can pin the extension for easy access while playing Cave Game.

Cave Game Tracker is currently undergoing review by the Chrome Web Store to become an official Chrome Extension.

Data
----
Cave Game Tracker saves your coordinates to your browser's local storage. If you reinstall the extension, your coordinates will be deleted. Please export your coordinates as a CSV before reinstalling the extension if you want access to your previous coordinates. Once Cave Game Tracker becomes an official Chrome Extenision, your data will remain safe during software updates. 

Cave Game Tracker collects certain data and sends it to a database. 

What kind of data? It sends your wolf/sheep's id, your wolf/sheep's pack, and your coordinates array. 

This data is only accessible to those actively developing Cave Game Tracker. Cave Game Tracker does not collect any sensitive/personal data, only the data listed above.

This data is being planned to be used in future versions of the Cave Game Tracker to assist users in avoiding pathways that have already been stepped on by other users.
