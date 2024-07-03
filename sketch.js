let GRID_SIZE = 3; // Default grid size
let CANVAS_SIZE = 800; // Default canvas size
let TILE_WIDTH;
let TILE_HEIGHT;
let backgroundColor = "#ffffff"; // Default background color

let gridState;
let uploadedImages = []; // Array to hold uploaded images
let tempUploadedFiles = []; // Temporary array to hold files before confirmation

let mouseGridX, mouseGridY;
let blankTileEnabled = false;
let randomRotationMirroring = false;

function preload() {
  // Do nothing here since we are loading images from user input
}

function setup() {
  if (random() < 1 / 10) {
    document.body.classList.add("sonicBg");
  }
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  angleMode(DEGREES);
  calculateTileSize();
  initializeGrid(); // Initialize grid state

  // Listen for changes in the file input
  let fileInput = document.getElementById("imageUpload");
  fileInput.addEventListener("change", function (event) {
    handleTempFiles(event.target.files);
  });

  // Listen for click on confirmButton to apply settings
  let confirmButton = document.getElementById("confirmButton");
  confirmButton.addEventListener("click", function () {
    applySettings();
  });

  // Listen for changes in the blankTileCheckbox
  let blankTileCheckbox = document.getElementById("blankTileCheckbox");
  blankTileCheckbox.addEventListener("change", function (event) {
    toggleBlankTile(event.target.checked);
  });

  // Listen for changes in the randomRotationMirroringCheckbox
  let randomRotationMirroringCheckbox = document.getElementById(
    "randomRotationMirroring"
  );
  randomRotationMirroringCheckbox.addEventListener("change", function (event) {
    randomRotationMirroring = event.target.checked;
  });
}

function calculateTileSize() {
  TILE_WIDTH = CANVAS_SIZE / GRID_SIZE;
  TILE_HEIGHT = CANVAS_SIZE / GRID_SIZE;
}

function initializeGrid() {
  gridState = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      type: 1, // Change default type to 1 to show images
      rotation: randomRotationMirroring ? random([0, 90, 180, 270]) : 0,
      mirrored: randomRotationMirroring ? random([true, false]) : false,
      imageIndex: -1, // Initialize with -1 indicating no image assigned yet
      scaleFactor: 1.0, // Initialize scale factor
    }))
  );

  // Assign random images to grid tiles for demonstration
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      gridState[x][y].imageIndex = int(random(uploadedImages.length));
    }
  }
}

function draw() {
  background(backgroundColor);
  fill(160, 82, 45);

  noStroke();
  ellipseMode(CORNER);

  mouseGridX = int(map(mouseX, 0, width, 0, GRID_SIZE));
  mouseGridY = int(map(mouseY, 0, height, 0, GRID_SIZE));

  // Ensure gridState is initialized before drawing
  if (gridState) {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        drawTile(x, y);
      }
    }
  }
}

function drawTile(x, y) {
  if (gridState[x] && gridState[x][y]) {
    const { type, rotation, mirrored, imageIndex, scaleFactor } =
      gridState[x][y];

    push();
    translate(
      x * TILE_WIDTH + TILE_WIDTH / 2,
      y * TILE_HEIGHT + TILE_HEIGHT / 2
    );
    rotate(rotation);
    scale(mirrored ? -scaleFactor : scaleFactor, scaleFactor);
    translate(-TILE_WIDTH / 2, -TILE_HEIGHT / 2);

    if (type === 1 && imageIndex >= 0 && imageIndex < uploadedImages.length) {
      if (uploadedImages[imageIndex] === "blank") {
        // Do nothing, don't show anything for the blank tile
      } else {
        image(uploadedImages[imageIndex], 0, 0, TILE_WIDTH, TILE_HEIGHT);
      }
    } else {
      noFill();
      rect(0, 0, TILE_WIDTH, TILE_HEIGHT);
    }

    pop();
  }
}

function handleTempFiles(files) {
  const previewContainer = document.getElementById("previewContainer");

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    if (file.type.startsWith("image/")) {
      tempUploadedFiles.push(file);
      const reader = new FileReader();
      reader.onload = function (e) {
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("imgWrapper");

        const imgElement = document.createElement("img");
        imgElement.src = e.target.result;
        imgElement.classList.add("previewImage");

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "X";
        deleteButton.classList.add("deleteButton");
        deleteButton.onclick = function () {
          deleteImage(tempUploadedFiles.indexOf(file));
        };

        imgWrapper.appendChild(imgElement);
        imgWrapper.appendChild(deleteButton);
        previewContainer.appendChild(imgWrapper);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload image files only.");
    }
  }
}

function addBlankTileOption() {
  // Add the blank tile entry to uploadedImages array
  uploadedImages.push("blank");
}

function toggleBlankTile(enabled) {
  blankTileEnabled = enabled;

  const previewContainer = document.getElementById("previewContainer");
  const blankTileIndex = uploadedImages.indexOf("blank");

  if (blankTileEnabled) {
    if (blankTileIndex === -1) {
      addBlankTileOption();
    }
  } else {
    if (blankTileIndex !== -1) {
      uploadedImages.splice(blankTileIndex, 1);
    }
  }
}

function deleteImage(index) {
  tempUploadedFiles.splice(index, 1);
  const previewContainer = document.getElementById("previewContainer");
  previewContainer.removeChild(previewContainer.childNodes[index]);

  // Re-render the previewContainer to update delete buttons' onclick functions
  for (let i = 0; i < previewContainer.childNodes.length; i++) {
    const deleteButton =
      previewContainer.childNodes[i].querySelector(".deleteButton");
    deleteButton.onclick = function () {
      deleteImage(i);
    };
  }
}

function applySettings() {
  // Update GRID_SIZE and CANVAS_SIZE based on user input
  GRID_SIZE = parseInt(document.getElementById("gridSize").value);
  CANVAS_SIZE = parseInt(document.getElementById("canvasSize").value);
  calculateTileSize();

  // Update background color based on user input
  backgroundColor = document.getElementById("bgColor").value;

  // Resize canvas according to new CANVAS_SIZE
  resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);

  // Reinitialize gridState with new GRID_SIZE
  initializeGrid();

  // Process and load images only after user hits confirm button
  uploadedImages = [];
  for (let i = 0; i < tempUploadedFiles.length; i++) {
    let file = tempUploadedFiles[i];
    let img = loadImage(URL.createObjectURL(file), () => {
      if (uploadedImages.length === tempUploadedFiles.length) {
        // All images loaded, reinitialize grid
        initializeGrid();
      }
    });
    uploadedImages.push(img);
  }

  // Add the blank tile option if enabled
  if (blankTileEnabled) {
    addBlankTileOption();
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    save("mySVG.png");
  }
  if (key === "r" || key === "R") {
    if (gridState[mouseGridX] && gridState[mouseGridX][mouseGridY]) {
      gridState[mouseGridX][mouseGridY].rotation =
        (gridState[mouseGridX][mouseGridY].rotation + 90) % 360;
    }
  }
  if (key === "m" || key === "M") {
    if (gridState[mouseGridX] && gridState[mouseGridX][mouseGridY]) {
      gridState[mouseGridX][mouseGridY].mirrored =
        !gridState[mouseGridX][mouseGridY].mirrored;
    }
  }
  if (key === "1") {
    if (gridState[mouseGridX] && gridState[mouseGridX][mouseGridY]) {
      gridState[mouseGridX][mouseGridY].scaleFactor *= 1.2;
    }
  } else if (key === "2") {
    if (gridState[mouseGridX] && gridState[mouseGridX][mouseGridY]) {
      gridState[mouseGridX][mouseGridY].scaleFactor /= 1.2;
    }
  }
  if (keyCode === RIGHT_ARROW) {
    incrementImageIndex(mouseGridX, mouseGridY);
  } else if (keyCode === LEFT_ARROW) {
    decrementImageIndex(mouseGridX, mouseGridY);
  }
}

function incrementImageIndex(x, y) {
  if (gridState[x] && gridState[x][y]) {
    if (gridState[x][y].imageIndex < uploadedImages.length - 1) {
      gridState[x][y].imageIndex++;
    } else {
      gridState[x][y].imageIndex = 0;
    }
  }
}

function decrementImageIndex(x, y) {
  if (gridState[x] && gridState[x][y]) {
    if (gridState[x][y].imageIndex > 0) {
      gridState[x][y].imageIndex--;
    } else {
      gridState[x][y].imageIndex = uploadedImages.length - 1;
    }
  }
}
