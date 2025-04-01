import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',

  backgroundColor: "#eee",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

const scores = [10, 20, 50, 100, 50, 20, 10, 5]; // Scores for each section

let launcher;
let ballLaunched = false;
let isDragging = false;
let pegsHit = 0;
let totalScore = 0;
let scoreText;

function preload() {
  this.load.image('ball', './images/ball.svg'); // Replace with actual path
  this.load.image('peg', './images/peg.svg'); // Replace with actual path
  this.load.image('launcher', './images/launcher.svg'); // Replace with actual launcher image path
}

function create() {
  // Add pegs
  this.pegs = this.physics.add.staticGroup();

  // Function to create a peg in a random position in the lower half of the screen
  const createRandomPeg = (previousX, previousY) => {
    let randomX, randomY;
    let isValidPosition = false;

    while (!isValidPosition) {
      randomX = Phaser.Math.Between(50, 750);
      randomY = Phaser.Math.Between(300, 550);

      isValidPosition = true;

      // Check distance from all existing pegs
      this.pegs.getChildren().forEach((peg) => {
        const distance = Phaser.Math.Distance.Between(randomX, randomY, peg.x, peg.y);
        if (distance < 40) {
          isValidPosition = false;
        }
      });
    }

    const peg = this.pegs.create(randomX, randomY, 'peg');
    peg.body.setCircle(20); // Imposta il corpo fisico come un cerchio con raggio 20
    peg.body.setOffset(0, 0); // Centra il corpo fisico
    return { x: randomX, y: randomY };
  };

  // Create the first peg
  createRandomPeg(0, 0);
  createRandomPeg(0, 0);
  createRandomPeg(0, 0);
  createRandomPeg(0, 0);
  createRandomPeg(0, 0);
  createRandomPeg(0, 0);

  // Create a placeholder for the ball
  this.ball = null;

  // Add launcher
  launcher = this.add.sprite(400, 50, 'launcher');
  launcher.setOrigin(0.5, 0.5);

  // Remove drag and drop control and make the launcher follow the mouse
  this.input.on('pointermove', (pointer) => {
    const angle = Phaser.Math.Angle.Between(launcher.x, launcher.y, pointer.x, pointer.y);
    launcher.setRotation(angle);
  });

  // Ensure the ball is created dynamically on launch
  this.input.on('pointerdown', (pointer) => {
    if (this.ball) {
      this.ball.destroy(); // Remove the previous ball
      ballLaunched = false; // Reset the launch state
    }

    if (!ballLaunched) {
      ballLaunched = true;
      scoresLabel.forEach((label) => {
        label.setFill('#000'); // Reset color for all labels
      });

      this.ball = this.physics.add.sprite(launcher.x, launcher.y, 'ball');
      this.ball.body.setCircle(25); // Imposta il corpo fisico come un cerchio con raggio 25
      this.ball.body.setOffset(0, 0); // Centra il corpo fisico
      this.ball.setBounce(0.8);
      this.ball.setCollideWorldBounds(true);
      this.ball.body.onWorldBounds = true;

      // Add collision between ball and pegs
      this.physics.add.collider(this.ball, this.pegs, (ball, peg) => {
        if (peg) {
          const { x, y } = peg;
          peg.destroy(); // Remove peg when hit
          createRandomPeg(x, y); // Create a new peg

          // Update scores
          pegsHit++;
          totalScore += 10; // Add 10 points for each peg hit
          updateScoreDisplay();
        }
      });

      const velocity = this.physics.velocityFromRotation(launcher.rotation, 400);
      this.ball.setVelocity(velocity.x, velocity.y);
    }
  });

  // Add labels with scores at the bottom
  const sectionWidth = 800 / scores.length; // Divide the width into 8 parts
  let scoresLabel = [];

  scores.forEach((score, index) => {
    const x = sectionWidth * index + sectionWidth / 2; // Center of each section
    const y = 580; // Position near the bottom
    const label = this.add.text(x, y, score.toString(), {
      font: '16px Arial',
      fill: '#000',
      align: 'center',
    }).setOrigin(0.5, 0.5); // Center the text

    scoresLabel.push(label);

    // Add a dividing line starting from the bottom and ending just above the labels
    if (index > 0) {
      const lineX = sectionWidth * index;
      this.add.line(lineX, 600, 0, 0, 0, -20, 0x000000).setOrigin(0.5, 0.5); // Black line
    }
  });

  initializeScoreDisplay(this);

  // Modify ball behavior when it touches the ground
  this.physics.world.on('worldbounds', (body) => {
    if (body.gameObject === this.ball && this.ball.body.blocked.down) { // Check if the ball touches the bottom
      this.ball.setVelocity(0, 0);
      this.ball.setBounce(0);
      this.ball.setAlpha(0.5); // Set opacity to 0.5
      ballLaunched = false; // Allow launching a new ball

      // Highlight the score section where the ball stopped
      const sectionIndex = Math.floor(this.ball.x / sectionWidth);
      const scoreLabel = scores[sectionIndex];
      totalScore += scores[sectionIndex];
      updateScoreDisplay();

      scoresLabel[sectionIndex].setFill('#f00');
      this.ball.body.onWorldBounds = false;
    }
  });
}

function update() {
  // Game logic updates
}

function initializeScoreDisplay(scene) {
  // Add score display in the top-right corner
  scoreText = scene.add.text(750, 20, `Pegs Hit: 0\nTotal Score: 0`, {
    font: '16px Arial',
    fill: '#000',
    align: 'right',
  }).setOrigin(1, 0); // Align to the top-right corner
}

function updateScoreDisplay() {
  scoreText.setText(`Pegs Hit: ${pegsHit}\nTotal Score: ${totalScore}`);
}