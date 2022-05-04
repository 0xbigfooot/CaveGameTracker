// Injected js

chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction',
});

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    // Receive message from popup
    if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
      
        // Collect the necessary data. 
        var woolfData = document.getElementsByClassName('flex flex-col items-center flex-shrink-0 mx-2 px-2 py-1 my-1 cursor-pointer border-4 border-red');
        var woolfImg = woolfData[0].childNodes[1].childNodes[0].src;
        var domInfo = {
        id: woolfData[0].childNodes[0].childNodes[1].data,
        imgSrc: woolfImg

      };
  
      // Directly respond to the sender (popup), 
      // through the specified callback.
      response(domInfo);
    }
});

// Object for holding woolfId, pack, and coordinates array.
class Woolf {
    constructor(id, pack) {
        this.id = id;
        this.pack = pack;
        this.coordinates = [];

        this.add = function(coords) {
            this.coordinates.push(coords)
        };
    }
}

// MutationObserver setup.
let options = {
    characterData: true
}

let observer = new MutationObserver(mCallBack);

// Observes changes in the coordinates div.
function mCallBack(mutations) {
    for (let mutation of mutations) {
        if (mutation.type === 'characterData') {
            // Gets woolf data.
            var woolfData = document.getElementsByClassName('flex flex-col items-center flex-shrink-0 mx-2 px-2 py-1 my-1 cursor-pointer border-4 border-red');
            var woolfId = woolfData[0].childNodes[0].childNodes[1].data;
            var woolfPack = woolfData[0].childNodes[2].childNodes[2].data;
            var coordinatesDiv = document.getElementsByClassName('mt-6 text-center');
            var newCoords = coordinatesDiv[0].childNodes[1].data;
            var liveCoords = liveCoordsConverter(newCoords)

            // Packs data into a woolf class and adds coordinates.
            if (newCoords == "(0, 0)") { 
                break; 
            }
            else {
                chrome.storage.local.get([woolfId], function(response) {
                    //Checks if woolfId exists in local storage.
                    if(Object.keys(response).length !== 0) {
                        let currentCoords = response[woolfId].coordinates[response[woolfId].coordinates.length - 1];
                        let currentCoordsArray = response[woolfId].coordinates;
                        if (String(currentCoords) !== String(liveCoords)) {
                            //Updates existing woolfId's coordinates
                            let tempArray = [];
                            tempArray = currentCoordsArray;
                            tempArray.push(liveCoords);
                            currentCoordsArray = tempArray;
                            chrome.storage.local.set({ [woolfId] : response[woolfId]}, function() {
                            })

                            // Updates coordinates in the database.
                            const Http = new XMLHttpRequest();
                            const url='https://cave-game-tracker.glitch.me/woolfs';

                            Http.open("PATCH", url);
                            Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            const httpWoolf  = {
                                "woolfId" : woolfId,
                                "pack" : woolfPack,
                                "coordinates" :
                                    liveCoords
                            }

                            Http.send(JSON.stringify(httpWoolf));
                        }                  
                    }
                    else {         
                        // Initializes current woolf data.
                        var woolf = new Woolf(woolfId, woolfPack);
                        woolf.add(liveCoords);
                        chrome.storage.local.set({ [woolfId] : woolf }, function() {
                        }); 

                        // Adds a new woolf to the database.
                        const Http = new XMLHttpRequest();
                        const url='https://cave-game-tracker.glitch.me/woolfs';

                        Http.open("POST", url);
                        Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        const httpWoolf  = {
                            "woolfId" : woolfId,
                            "pack" : woolfPack,
                            "coordinates" :
                                [liveCoords]
                        }

                        Http.send(JSON.stringify(httpWoolf));
                    }
                });
 
            }
        }
    }
}

function liveCoordsConverter(str) {
    //Find X coordinate
    let reStartX = /[(]/g;
    let reEndX = /[,]/g;
    let xStartIndex = str.search(reStartX) + 1;
    let xEndIndex = str.search(reEndX);
    let xCoordinate = str.slice(xStartIndex, xEndIndex);

    //Find Y coordinate.
    let reStartY = /[,]/g;
    let yStartIndex = str.search(reStartY) + 1
    let reEndY = /[)]/g;
    let yEndIndex = str.search(reEndY);
    let yCoordinate = str.slice(yStartIndex, yEndIndex);

    return [Number(xCoordinate), Number(yCoordinate)]
}

//Starts the mutation observer.
function startObserving(targetNode) {
    if (targetNode[0].childNodes[1])
        observer.observe(targetNode[0].childNodes[1], options);
}

//Read initial coordinates.
window.addEventListener('load',function(e){
    setTimeout(function() {
        var targetNode = this.document.getElementsByClassName('mt-6 text-center');
        startObserving(targetNode);
    }, 1000)
});
