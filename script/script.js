let canvasCtx = document.getElementById("canvas").getContext("2d");
let sliderSound = document.getElementById("sliderSound");
let tileSound = document.getElementById("tileSound");

canvasCtx.font = "20px Arial";

const generateColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let saturation = Math.floor(Math.random() * 100);
  let lightness = Math.floor(Math.random() * 75);

  return `hsl(${hue},${saturation}%,${lightness}%)`;
};

const canvasWidth = 600,
  canvasHeight = 600;

let sliderData = {
  size: {
    height: 10,
    width: 120,
  },
  position: {
    x: 100,
    y: 520,
  },
  color: generateColor(),
  isMovingLeft: false,
  isMovingRight: false,
};

let ballData = {
  size: {
    radius: 6,
  },
  position: {
    x: 50,
    y: 250,
  },
  color: generateColor(),
  speed: {
    x: 5,
    y: 5,
  },
};

let gameData = {
  tiles: [],
  isRunning: false,
  intervalId: null,
  userScore: 0,
};

const resetGameObjectPositions = () => {
  sliderData.position = {
    x: 100,
    y: 520,
  };
  ballData = {
    ...ballData,
    position: {
      x: 50,
      y: 250,
    },
    speed: {
      x: 5,
      y: 5,
    },
  };
};

const renderBall = () => {
  canvasCtx.save();
  canvasCtx.fillStyle = ballData.color;
  canvasCtx.beginPath();
  canvasCtx.arc(
    ballData.position.x,
    ballData.position.y,
    ballData.size.radius,
    0,
    Math.PI * 2
  );
  canvasCtx.fill();
  canvasCtx.restore();
};

const renderGameObject = (gameObject) => {
  canvasCtx.save();
  canvasCtx.fillStyle = gameObject.color;
  canvasCtx.fillRect(
    gameObject.position.x,
    gameObject.position.y,
    gameObject.size.width,
    gameObject.size.height
  );
  canvasCtx.restore();
};

document.onkeydown = (e) => {
  if (e.code === "ArrowLeft") {
    sliderData.isMovingLeft = true;
    sliderData.isMovingRight = false;
  } else if (e.code === "ArrowRight") {
    sliderData.isMovingRight = true;
    sliderData.isMovingLeft = false;
  } else if (e.code === "Space" && !gameData.isRunning) {
    startGame();
  }
};

document.onkeyup = (e) => {
  if (e.code === "ArrowLeft") {
    sliderData.isMovingLeft = false;
  } else if (e.code === "ArrowRight") {
    sliderData.isMovingRight = false;
  }
};

const updateSliderPosition = () => {
  if (sliderData.isMovingLeft) {
    sliderData.position.x -= 5;
  }
  if (sliderData.isMovingRight) {
    sliderData.position.x += 5;
  }
  if (sliderData.position.x < 0) {
    sliderData.position.x = 0;
  }
  if (sliderData.position.x > canvasWidth - sliderData.size.width) {
    sliderData.position.x = canvasWidth - sliderData.size.width;
  }
};

const updateBallPosition = () => {
  ballData.position.x -= ballData.speed.x;
  ballData.position.y += ballData.speed.y;
  if (ballData.position.x < 0 || ballData.position.x > canvasWidth) {
    ballData.speed.x *= -1;
  }
  if (ballData.position.y < 0 || ballData.position.y > canvasHeight) {
    ballData.speed.y *= -1;
  }
};

const detectCollision = (gameObject, isSlider = false) => {
  if (isSlider && ballData.speed.y < 0) {
    return false;
  }
  const isAfterObjectLeft =
    gameObject.position.x < ballData.position.x + ballData.size.radius;
  const isBeforeObjectRight =
    gameObject.position.x + gameObject.size.width > ballData.position.x;
  const isAfterObjectTop =
    gameObject.position.y < ballData.position.y + ballData.size.radius;
  const isBeforeObjectBottom =
    gameObject.position.y + gameObject.size.height > ballData.position.y;

  return (
    isAfterObjectLeft &&
    isBeforeObjectRight &&
    isAfterObjectTop &&
    isBeforeObjectBottom
  );
};

const detectTileCollision = () => {
  for (let index in gameData.tiles) {
    if (detectCollision(gameData.tiles[index])) {
      delete gameData.tiles[index];
      ballData.speed.y *= -1;
      tileSound.play();
      gameData.userScore++;
    }
  }
};

const generateTiles = () => {
  gameData.tiles = [];
  let tileX = 7.5,
    tileY = 5;
  for (let row = 0; row <= 4; row++) {
    tileX = 7.5;
    for (let cell = 0; cell <= 9; cell++) {
      gameData.tiles.push({
        position: {
          x: tileX,
          y: tileY,
        },
        size: {
          height: 20,
          width: 54,
        },
        color: generateColor(),
      });
      tileX += 59;
    }
    tileY += 25;
  }
};

const addTextToCenter = (text) => {
  canvasCtx.fillText(
    text,
    canvasWidth / 2 - canvasCtx.measureText(text).width / 2,
    canvasHeight / 2
  );
};

const isUserWon = () => {
  if (gameData.userScore === 50) {
    addTextToCenter("Won!!! Press space to continue");
    gameData.isRunning = false;
    generateTiles();
    gameData.userScore = 0;
    clearInterval(gameData.intervalId);
    return true;
  }
};

const isBallFell = () => {
  if (ballData.position.y > canvasHeight) {
    addTextToCenter("Died!!! Press space to continue");
    gameData.isRunning = false;
    clearInterval(gameData.intervalId);
    return true;
  }
};

const update = () => {
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  if (isBallFell() || isUserWon()) {
    return;
  }
  renderGameObject(sliderData);
  gameData.tiles.forEach(renderGameObject);
  renderBall();
  updateSliderPosition();
  updateBallPosition();
  if (detectCollision(sliderData, true)) {
    ballData.speed.y *= -1;
    sliderSound.play();
  }
  detectTileCollision();
  canvasCtx.fillText("Score : " + gameData.userScore, 10, 580);
};

generateTiles();

const startGame = () => {
  resetGameObjectPositions();
  gameData.intervalId = setInterval(() => {
    update();
  }, 20);
  gameData.isRunning = true;
};

addTextToCenter("Press space to begin!!!");
