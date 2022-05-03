
// Update popup with data from the current NFT selected.
const setDOMInfo = info => {
  
  //Imports current NFT from the web page.
  document.getElementById('nftId').textContent = ("#" + info.id);
  
  //Creates svg from the image source of current NFT selected.
  svgCreator(info.imgSrc);
  
  //Load woolf data into the popup.
  chrome.storage.local.get([info.id], function(response) {
    
    //Reverses coordinates so the current coordinates are first in the list.
    liveCoordinates = response[info.id].coordinates.reverse();
    
    //Formats coordinates into the coordinates list.
    for (coord in liveCoordinates) {
      let br = document.createElement("br");
      coordinateList.append("(" + liveCoordinates[coord] + ")")
      coordinateList.append(br)
      //Sets Coordinates Header
      coordinatesHeader.textContent = ("(" + liveCoordinates[0] + ")")
    }
  })
};

//Creates svg from image encoded in base64 from the web page
function svgCreator(imgSrc) {
  var svgimg = document.createElementNS("http://www.w3.org/2000/svg", "image");
  
  // New image.
  svgimg.setAttribute( 'width', '100' );
  svgimg.setAttribute( 'height', '100' );

  svgimg.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', imgSrc);

  //Appends image to the top right corner of the popup.
  document.getElementById("mySvg").appendChild(svgimg);
}

//Sends a message to the DOM requesting data once the DOM loads
// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', () => {
  
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called 
        //    from the receiving end (content script).
        setDOMInfo);
  });
}); 

directionReturner = function(coordinates) {
  array = [];
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

var liveCoordinates = [];

var coordinateList = document.getElementById('coordinateList');

var coordinatesHeader = document.getElementById('coordinatesHeader')

//----------MAPPING----------

var w = 20.7;
var grid = [];
var stack = [];

var cols, rows;
var current;

//Begin the drawing function.
let sketch = function(p) {

  p.setup = function() {

    //Creates a canvas of size 352x352
    p.createCanvas(352,352);
    cols = Math.floor(352 / w); // cols = 11
    rows = Math.floor(352 / w); // rows = 11
    p.frameRate(20);

    //Creates initial grid of cols x rows amount of Cells.
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var cell = new Cell(i, j);
        grid.push(cell);
      }
    }
    current = grid[144];
  };
    var counter = 0;
    
    //Draw Function
    p.draw = function() {
        //Background color
      p.background(235, 227, 211);
      for (var i = 0; i < grid.length; i++) {
        grid[i].show(p);
      }
      //Grabs nftId from popup DOM. Didn't feel like sending a message to the DOM again.
      var nftIdRough = document.getElementById('nftId').textContent
      var nftId = nftIdRough.substring(1, nftIdRough.length)

      //Grabs nftId's data
      chrome.storage.local.get([nftId], function(res) {
        if (Object.keys(res).length !== 0) {
          //Step on a plot.
          current.visited = true;
          
          //Keeps track of path freshness.
          //current.timesVisited++;
          
          //Flips the order of the coordinates array to newest -> oldest
          let newCoords = res[nftId].coordinates.reverse();
          
          //Converts coordinates into directions ('Up', 'Right'...)
          if(current.done) {
            p.noLoop();
          }
          let newDirections = directionReturner(newCoords);
          
          //Moves the cursor.
          var next = current.move(newDirections[counter]);
          counter++;
          if(next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
          } else if (stack.length > 0) {
            current = stack.pop();
          }
          if(counter == (newDirections.length)) {
            p.noLoop();
          }
        } 
      })   
    }
};

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

    //If there is a wall to the right
    if (this.walls[0]) {
      //Draws line to right
      p.line(x, y, x + w, y);
    }
    if (this.walls[1]) {
      //Draws line up
      p.line(x + w, y, x + w, y + w);
    }
    if (this.walls[2]) {
      //Draws line left
      p.line(x + w, y + w, x, y + w);
    }
    if (this.walls[3]) {
      //Draws line down
      p.line(x, y + w, x, y);
    }

    if (this.visited) {
      p.noStroke();
      //Drawer fill color
      p.fill(0, 255, 60, 100);
      var origin = Math.floor(cols / 2);
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

//Creates the map.
new p5(sketch, 'drawingWindow');

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

//Exports coordinates to a CSV file.
const fetchCoordinates = info => {
  chrome.storage.local.get([info.id], function(response) {
    //Reverses coordinates so the current coordinates are first in the list.
    liveCoordinates = response[info.id].coordinates.reverse();
    //Creates csv file.

    counter = 0;
    var csvContent = info.id + '\n';
    csvContent += 'Move, X Coordinate, Y Coordinate\n';
    for (elem in liveCoordinates) {
      csvContent += (liveCoordinates.length - (counter)) + "," + liveCoordinates[counter].join(',') + "\n";
      counter++;
    }

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