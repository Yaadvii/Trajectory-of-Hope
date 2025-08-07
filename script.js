let player, obstacles = [], score = 0, bgBrightness = 0, meteor = null;
let celestialObjects = [], saturn = null, jupiter = null, planetVisible = false;
let gameState = 'welcome';

function setup() {
  createCanvas(600, 400);
  player = new Player();
  obstacles.push(new Obstacle());

  // Fixed position of stars in the background
  let starPositions = [
    [50, 60], [150, 30], [280, 80], [420, 45], [520, 90],
    [80, 220], [200, 180], [350, 200], [480, 250], [550, 320],
    [30, 350], [120, 300], [250, 340], [380, 360], [450, 180], [320, 280]]
    ;
  celestialObjects = starPositions.map(pos => new CelestialObject(pos[0], pos[1]));

  // Spawn initial planet
  spawnPlanet();
}
function draw() {
  if (gameState === 'welcome') {
    showWelcomeScreen();
    return;
  }
  background(bgBrightness);
  player.update();
  player.show();
  if (frameCount % 60 === 0) obstacles.push(new Obstacle());

  // Update celestial objects
  celestialObjects.forEach(star => { star.update(); star.show(); });

  // Handle planets
  updatePlanet(saturn, 'saturn');
  updatePlanet(jupiter, 'jupiter');
  if (!planetVisible) spawnPlanet();
  // Handle meteors
  let meteorScores = [2, 5, 7, 13, 15, 17, 19, 22, 26, 33, 38, 41];
  if (meteorScores.includes(score) && !meteor) meteor = new Meteor();
  if (meteor) {
    meteor.update();
    meteor.show();
    if (meteor.hits(player)) gameOver("You faced a minor setback. Don't lose hope!");
    if (meteor.offscreen()) meteor = null;
  }
  // Handle obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].show();

    if (obstacles[i].hits(player)) {
      gameOver("You faced an obstacle. Don't lose hope.");
    }
    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
      score++;
      player.grow(0.5);
      if (bgBrightness < 100) bgBrightness += 2;
      if (score >= 50) {
        noLoop();
        showWinMessage();
      }
    }
  }
  // Score display
  fill(255);
  textSize(16);
  text("Obstacles overcome: " + score, 10, 20);
}
function spawnPlanet() {
  if (random() < 0.5) {
    saturn = new Planet('saturn', random(50, width - 50), height + 50);
  } else {
    jupiter = new Planet('jupiter', random(50, width - 50), height + 50);
  }
  planetVisible = true;
}
function updatePlanet(planet, type) {
  if (planet) {
    planet.update();
    planet.show();
    if (planet.offscreen()) {
      if (type === 'saturn') saturn = null;
      else jupiter = null;
      planetVisible = false;
    }
  }
}

function gameOver(message) {
  noLoop();
  fill(255, 0, 0);
  textSize(24);
  textAlign(CENTER);
  text(message, width / 2, height / 2 - 20);
  fill(0, 255, 0);
  textSize(18);
  text("Click refresh to try again", width / 2, height / 2 + 20);
}

function showWinMessage() {
  fill(0, 255, 0);
  textSize(20);
  textAlign(CENTER);
  text("Congratulations! You've discovered that hope isn't just \n about reaching the destination - it's about growing \n stronger with every challenge you face, \n You overcame all obstacles and your light \n now shines brightest in the cosmos!", width / 2, height / 2);
  fill(255, 255, 200);
  textSize(16);
  text("Final Score: " + score, width / 2, height / 2 + 60);
}

function showWelcomeScreen() {
  background(0);
  celestialObjects.forEach(star => { star.update(); star.show(); });
  
  fill(255, 255, 150);
  textAlign(CENTER);
  textSize(28);
  text("Light in the Dark", width / 2, 50);
  
  fill(255);
  textSize(17);
  text("Welcome.\n Use Up and Down arrow keys to make your star avoid the asteroid belts and stay safe from the meteors.\n Remember, no matter what happens, don't lose hope", width / 2, 120);
  
  fill(200);
  textSize(16);
  text("Click anywhere to start your journey.", width / 2, 250);
}
function mousePressed() {
  if (gameState === 'welcome') {
    gameState = 'playing';
  }
}

class Player {
  constructor() {
    this.x = 100;
    this.y = height / 2;
    this.r = 10;
  }
  update() {
    if (gameState === 'playing') {
      if (kb.pressing('ArrowUp') || kb.pressing('w')) this.y -= 5;
      if (kb.pressing('ArrowDown') || kb.pressing('s')) this.y += 5;
      this.y = constrain(this.y, this.r, height - this.r);
    }
  }
  grow(amount) {
    this.r += amount;
  }
  show() {
    if (!this.starSprite) {
      let starPattern = `....y...,
...yyy...
..yyyyy..
.yyyyyyy.
yyyyyyyyy
.yyyyyyy.
..yyyyy..
...yyy...
....y...,`;
      this.starSprite = spriteArt(starPattern, 3);
    }

    push();
    translate(this.x, this.y);
    let scaleAmount = this.r / 20;
    scale(scaleAmount);

    drawingContext.shadowColor = 'yellow';
    drawingContext.shadowBlur = 15;

    imageMode(CENTER);
    image(this.starSprite, 0, 0);

    drawingContext.shadowBlur = 0;
    pop();
  }
}

class Obstacle {
  constructor() {
    this.x = width;
    this.speed = 3;
    this.h = random() < 0.3 ? height / 2 : random(40, 150);
    this.y = random([0, height - this.h]);
    this.stones = [];
    this.createStones();
  }

  createStones() {
    let currentY = this.y + this.h;
    let stoneHeight = 0;

    while (stoneHeight < this.h) {
      let stone = {
        x: this.x + random(-8, 8),
        y: currentY - random(12, 20),
        w: random(15, 25),
        h: random(12, 18),
        rotation: random(0, TWO_PI),
        color: random(['#4a4a4a', '#5a5a5a', '#3a3a3a', '#6a6a6a']),
        craters: []
      };

      for (let i = 0; i < random(1, 3); i++) {
        stone.craters.push({
          x: random(-stone.w/2, stone.w/2),
          y: random(-stone.h/2, stone.h/2),
          r: random(2, 4)
        });
      }

      this.stones.push(stone);
      currentY = stone.y;
      stoneHeight += stone.h;
    }
  }

  update() {
    this.x -= this.speed;
    this.stones.forEach(stone => stone.x -= this.speed);
  }

  show() {
    this.stones.forEach(stone => {
      push();
      translate(stone.x + stone.w/2, stone.y + stone.h/2);
      rotate(stone.rotation);

      fill(stone.color);
      stroke(100);
      strokeWeight(1);
      ellipse(0, 0, stone.w, stone.h);

      fill(30);
      noStroke();
      stone.craters.forEach(crater => ellipse(crater.x, crater.y, crater.r));

      fill(150, 150, 150, 80);
      ellipse(-stone.w/4, -stone.h/4, stone.w/3, stone.h/3);
      pop();
    });
  }

  hits(player) {
    return this.stones.some(stone => {
      let distance = dist(player.x, player.y, stone.x + stone.w/2, stone.y + stone.h/2);
      return distance < (max(stone.w, stone.h)/2 + player.r);
    });
  }

  offscreen() {
    return this.x < -50;
  }
}

class Meteor {
  constructor() {
    this.x = random(50, width - 50);
    this.y = 0;
    this.r = 12;
    this.speed = 4;
    this.flameParticles = Array(8).fill().map(() => ({
      x: 0, y: 0, size: random(3, 8), alpha: random(150, 255)
    }));
  }

  update() {
    this.y += this.speed;
    this.flameParticles.forEach(particle => {
      particle.x = random(-this.r * 0.8, this.r * 0.8);
      particle.y = random(-this.r * 1.5, -this.r * 0.5);
      particle.alpha = random(100, 255);
    });
  }

  show() {
    push();
    translate(this.x, this.y);

    this.flameParticles.forEach(particle => {
      fill(255, 140, 0, particle.alpha * 0.8);
      noStroke();
      ellipse(particle.x, particle.y, particle.size);
      fill(255, 255, 0, particle.alpha * 0.6);
      ellipse(particle.x, particle.y, particle.size * 0.6);
    });

    fill(80, 50, 30);
    stroke(255, 100, 0);
    strokeWeight(2);
    ellipse(0, 0, this.r * 2);

    fill(120, 80, 50);
    noStroke();
    ellipse(-5, -3, 6);
    ellipse(7, 2, 4);
    ellipse(-2, 8, 5);
    pop();
  }

  hits(player) {
    return dist(this.x, this.y, player.x, player.y) < (this.r + player.r);
  }

  offscreen() {
    return this.y - this.r > height;
  }
}

class CelestialObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(1, 2.5);
    this.twinkle = random(150, 255);
  }

  update() {
    if (random() < 0.05) this.twinkle = random(80, 255);
  }

  show() {
    push();
    fill(255, 255, 200, this.twinkle);
    stroke(255, 255, 150, this.twinkle * 0.9);
    strokeWeight(1.2);

    beginShape();
    vertex(this.x, this.y - this.r * 2);
    vertex(this.x - this.r * 0.3, this.y - this.r * 0.3);
    vertex(this.x - this.r * 2, this.y);
    vertex(this.x - this.r * 0.3, this.y + this.r * 0.3);
    vertex(this.x, this.y + this.r * 2);
    vertex(this.x + this.r * 0.3, this.y + this.r * 0.3);
    vertex(this.x + this.r * 2, this.y);
    vertex(this.x + this.r * 0.3, this.y - this.r * 0.3);
    endShape(CLOSE);

    fill(255, 255, 200, this.twinkle * 0.8);
    noStroke();
    ellipse(this.x, this.y, this.r * 0.8);

    fill(255, 255, 200, this.twinkle * 0.1);
    ellipse(this.x, this.y, this.r * 6);
    pop();
  }
}

class Planet {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.speed = random(0.5, 1.2);

    if (type === 'saturn') {
      this.r = random(15, 20);
      this.color = color(255, 215, 140);
    } else {
      this.r = random(18, 25);
      this.color = color(200, 150, 100);
      this.stripeOffset = random(0, TWO_PI);
    }
  }

  update() {
    this.y -= this.speed;
  }

  show() {
    push();
    fill(this.color);
    stroke(255, 255, 255, 100);
    strokeWeight(1);
    ellipse(this.x, this.y, this.r * 2);

    if (this.type === 'saturn') {
      noFill();
      stroke(200, 200, 200, 150);
      strokeWeight(2);
      ellipse(this.x, this.y, this.r * 2.8);
      strokeWeight(1);
      ellipse(this.x, this.y, this.r * 3.2);
    } else {
      noFill();
      stroke(150, 100, 60, 120);
      strokeWeight(1.5);
      for (let i = -2; i <= 2; i++) {
        arc(this.x, this.y + i * this.r * 0.4, this.r * 1.8, this.r * 0.3, 0, PI);
      }
      fill(180, 80, 60, 150);
      noStroke();
      ellipse(this.x + this.r * 0.3, this.y + this.r * 0.2, this.r * 0.4, this.r * 0.25);
    }
    pop();
  }
  offscreen() {
    return this.y + this.r < 0;
  }
}