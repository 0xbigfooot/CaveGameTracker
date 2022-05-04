const nftGetter = {};
const workingArray = {};
const originDataObj = {};
var liveCoordinates = [];
var coordinateList = document.getElementById('coordinateList');
var coordinatesHeader = document.getElementById('coordinatesHeader');

// Update popup with data from the current NFT selected.
const setDOMInfo = info => {
  // Imports current NFT from the web page.
  document.getElementById('nftId').textContent = ("#" + info.id);
  const nftScraped = document.getElementById('nftId').textContent;
  const nftId = nftScraped.substring(1, nftScraped.length);

  chrome.storage.local.get([nftId], function(res) {
    // Gets nftId's data from local storage and assigns it to the nftGetter object. 
    Object.assign(nftGetter, res[nftId]);

    // Instead of going from the center of the map to the boundary, we want to go
    // from the boundary of the map to the center.

    // Reverses the coordinates from newest -> oldest to oldest -> newest
    var newCoords = nftGetter.coordinates.reverse();
    // Converts coordinates into directions such as "Up", "Down"...
    var newDirections = directionReturner(newCoords);
    // Calculates the starting point of the path and the path length.
    var originData = originFinder(newDirections);
    // Assigns originData to the originDataObj object. 
    Object.assign(originDataObj, originData);
    // Reverses the directions to their opposites ("Right" becomes "Left").
    var preWorkingArray = directionReverser(newDirections);
    // Shortens the preWorkingArray to the size of the path that fits the boundaries.
    preWorkingArray.length = originData[1];
    // Reverses preWorkingArray.
    preWorkingArray.reverse();
    // preWorkingArray now goes from map boundary to origin.
    // Assign preWorkingArray to the workingArray object.
    Object.assign(workingArray, preWorkingArray);

    // Creates the map using the sketch() function and places it in the #drawingWindow div.

    new p5(sketch, 'drawingWindow');
  })

  // Creates an svg from the image source of current NFT selected.
  svgCreator(info.imgSrc);
  
  // Load woolfs data into the popup.
  chrome.storage.local.get([info.id], function(response) {
    
    // Reverses coordinates so the current coordinates are first in the list.
    liveCoordinates = response[info.id].coordinates.reverse();
    
    // Formats coordinates into the coordinates list.
    for (coord in liveCoordinates) {
      let br = document.createElement("br");
      coordinateList.append("(" + liveCoordinates[coord] + ")")
      coordinateList.append(br)
      // Sets text content for the #coordintatesHeader div. 
      coordinatesHeader.textContent = ("(" + liveCoordinates[0] + ")")
    }
  })
};

// Creates an svg from the encoded base64 string from the web page.
function svgCreator(imgSrc) {
  var svgimg = document.createElementNS("http://www.w3.org/2000/svg", "image");
  
  // New image.
  svgimg.setAttribute( 'width', '100' );
  svgimg.setAttribute( 'height', '100' );

  svgimg.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', imgSrc);

  // Appends an image to the top right corner of the popup.
  document.getElementById("mySvg").appendChild(svgimg);
}

// Sends a message to the DOM requesting data once the DOM loads
// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', () => {
  
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    
    // ...send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called 
        //    from the receiving end (content script).
        setDOMInfo);
  });

}); 

// Converts an array of coordinates into an array of directions ("Up", "Down"...).
function directionReturner(coordinates) {
  let array = [];
  for (let i = 1; i < coordinates.length; i++) {
    if (i > 0) {
      for (let j = 0; j < 2; j++) {
        if (j == 0) {
          if (coordinates[i][j] == coordinates[i - 1][j] + 1) {
            array.push('Right')
          }
          if (coordinates[i][j] == coordinates[i - 1][j] - 1) {
            array.push('Left')
          }
        }
        if (j == 1) {
          if (coordinates[i][j] == coordinates[i - 1][j] + 1) {
            array.push('Down')
          }
          if (coordinates[i][j] == coordinates[i - 1][j] - 1) {
            array.push('Up')
          }
        }
      }
    }
  }
  return array;
}

// Given an array of directions, return the location that a path following those directions
// crashes into the map boundary, and the length of the path.
function originFinder(directions) {
    var outOfBounds = false;
    var origin = 8;
    var count = 0;
    var bounds = 16;
    var boundsChecker = [origin , origin];
    for (var dir in directions) {
        if (!outOfBounds) {
            if (directions[dir] == 'Up') {
              if((boundsChecker[1] - 1) < 0) {
                  outOfBounds = true;
                  break;
              }
              boundsChecker[1]--;
              count++;
              continue;
            }

            if (directions[dir] == 'Right') {
                if((boundsChecker[0] + 1) > bounds) {
                    outOfBounds = true;
                    break;
                } 
                boundsChecker[0]++;
                count++;
                continue;

            }

            if (directions[dir] == 'Down') {
              if((boundsChecker[1] + 1) > bounds) {
                  outOfBounds = true;
                  break;
              }
              boundsChecker[1]++;
              count++;
              continue;
              
            }

            if (directions[dir] == 'Left') {
              if((boundsChecker[0] - 1) < 0) {
                  outOfBounds = true;
                  break;
              }
              boundsChecker[0]--;
              count++;
              continue; 
            }          
          }
          
    }

    // i + j * cols (Returns a location on the grid)
    let finalOrigin = boundsChecker[0] + boundsChecker[1] * (bounds + 1);
    // Returns an array with the starting point and how many moves it 
    // took to get there.
    let result = [finalOrigin, count]
    return result;
}

// Converts an array of directions to its opposites ("Left" becomes "Right"...).
function directionReverser(directions) {
    for (dir in directions) {
      if(directions[dir] == 'Up') {
        directions[dir] = 'Down';
        continue;
      }
      if(directions[dir] == 'Right') {
        directions[dir] = 'Left';
        continue;
      }
      if(directions[dir] == 'Down') {
        directions[dir] = 'Up';
        continue;
      }
      if(directions[dir] == 'Left') {
        directions[dir] = 'Right';
        continue;
      }
    }
    return directions;
}

// ----------MAPPING----------

//Constant for map width
var w = 20.7;
// A cols x rows grid filled with Cell objects.
var grid = [];
var stack = [];

var cols, rows;
// Current Cell
var current;

// Begin the drawing function.
let sketch = function(p) {
  // The p5 library runs a setup() and draw() function.
  // setup() runs first, then draw() runs.
  // Part of the 
  p.setup = function() {
    
    //Creates a canvas of size 352x352
    p.createCanvas(352,352);
    // cols = 17
    cols = Math.floor(352 / w); 
    // rows = 17
    rows = Math.floor(352 / w); 
    // Makes the drawing run at 30fps
    p.frameRate(20);

    //Creates initial grid of cols x rows amount of Cells.
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var cell = new Cell(i, j);
        grid.push(cell);
      }
    }

    // Sets the starting Cell that the path begins at.
    let center = originDataObj[0];
    current = grid[center];
    
  };

  var counter = 0;

  // Draw function
  function drawMap() {
        p.draw = function() {
        // Sets background color.
        p.background(235, 227, 211);
        for (var i = 0; i < grid.length; i++) {
          grid[i].show(p);
        }
            current.visited = true;

            // Sets the next move.
            var next = current.move(workingArray[counter]);
            counter++;
            if(next) {
              next.visited = true;
              stack.push(current);
              removeWalls(current, next);
              current = next;
            } else if (stack.length > 0) {
              current = stack.pop();
            }
            // At the end of the path, end the drawing.
            if(counter == (originDataObj[1]) + 1) {
              p.noLoop();
            }
        }
    } 
    drawMap();     
};

// Removes walls to create maze like walls.
function removeWalls(a, b) {
  var x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  var y = a.j - b.j;
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

// Checks if a Cell's index is out of bounds, then returns its position on the grid.
function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  return i + j * cols;
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.walls = [true, true, true, true];
  this.visited = false;
  this.timesVisited = 0;
  this.boundsTracker = [0,0];
  this.inbounds = true;
  this.done = false;

  this.move = function(direction) {
    var up = grid[index(i, j - 1)];
    var right = grid[index(i + 1, j)];
    var down = grid[index(i, j + 1)];
    var left = grid[index(i - 1, j)];

    if(this.inbounds) {
      if (direction == 'Up') {
        if(index(i,j - 1) == - 1) {
          this.inbounds = false;
          return grid[index(this.i, this.j)];
        }
        this.timesVisited++;
        return up;
      }
      if (direction == 'Right') {
        if(index(i + 1, j) == - 1) {
          this.inbounds = false;
          return grid[index(this.i, this.j)];
        }
        this.timesVisited++;
        return right;
      }
      if (direction == 'Down') {
        if(index(i, j + 1) == - 1) {
          this.inbounds = false;
          return grid[index(this.i, this.j)];
        }
        this.timesVisited++;
        return down;
      }
      if (direction == 'Left') {
        if(index(i - 1, j) == - 1) {
          this.inbounds = false;
          return grid[index(this.i, this.j)];
        }
        this.timesVisited++;
        return left;
      }
      else {
        return undefined;
      }
    } else {
      this.done = true;
    }
}

  this.show = function(p) {
    var x = this.i * w;
    var y = this.j * w;
    p.stroke(255);

    // If there is a wall to the right
    if (this.walls[0]) {
      // Draws line to right
      p.line(x, y, x + w, y);
    }
    if (this.walls[1]) {
      // Draws line up
      p.line(x + w, y, x + w, y + w);
    }
    if (this.walls[2]) {
      // Draws line left
      p.line(x + w, y + w, x, y + w);
    }
    if (this.walls[3]) {
      // Draws line down
      p.line(x, y + w, x, y);
    }

    if (this.visited) {
      p.noStroke();
      // Path fill color
      p.fill(0, 255, 60, 100);
      var origin = Math.floor(cols / 2);
      // Darker green fill of center of the map.
      if (this.i == origin && this.j == origin) {
        p.fill(0, 225, 52);
      }
      p.rect(x, y, w, w);
      if (this.timesVisited == 2) {
        p.fill(255, 247, 0, 100);
        p.rect(x,y,w, w);
      }
      if (this.timesVisited > 2) {
        p.fill(214, 1, 1, 100);
        p.rect(x,y,w, w);
      }
    }
  }
}

let dataButton = document.getElementById('dataButton');
let drawingWindow = document.getElementById('drawingWindow');
let download = document.getElementById('download');

//Toggles between map view and coordinate view
function clicked() {
  if (drawingWindow.style.display == '') {
    drawingWindow.style.display = 'none';
    coordinateList.style.display = 'block';
    download.style.display = 'block';
  }
  else {
    drawingWindow.style.display = '';
    coordinateList.style.display = 'none';
    download.style.display = 'none';
  }
}
dataButton.onclick = clicked;

//----------EXPORTING COORDINATES----------

let exportButton = document.getElementById('exportButton');

// Exports coordinates to a CSV file.
const fetchCoordinates = info => {
  chrome.storage.local.get([info.id], function(response) {
    // Reverses coordinates so the current coordinates are first in the list.
    liveCoordinates = response[info.id].coordinates.reverse();
    // Creates csv file.

    counter = 0;
    var csvContent = info.id + '\n';
    csvContent += 'Move, X Coordinate, Y Coordinate\n';
    for (elem in liveCoordinates) {
      csvContent += (liveCoordinates.length - (counter)) + "," + liveCoordinates[counter].join(',') + "\n";
      counter++;
    }

    // Downloads csv.
    function download(filename, content) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    }
    
    // Start file download.
    let csvName = "#" + info.id+ "coordinates.csv";
    download(csvName, csvContent);
  })
}

exportButton.addEventListener('click', () => {
  //Query for the active tab.
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    //Send a request for the DOM info.
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        //Specify a callback to be called 
        //from the receiving end (content script).
        fetchCoordinates);
  });
});
