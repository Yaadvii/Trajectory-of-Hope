
let player;
let obstacles = [];
let score = 0;
let lightRadius = 50;
let bgBrightness = 0;

function setup() {
  createCanvas(600, 400);
  player = new Player();
  obstacles.push(new Obstacle());
}

function draw() {
  background(bgBrightness);

  player.update();
  player.show();

  if (frameCount % 100 === 0) {
    obstacles.push(new Obstacle());
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].show();

    if (obstacles[i].hits(player)) {
      noLoop(); // Game Over
      fill(255, 0, 0);
      textSize(32);
      textAlign(CENTER);
      text("You lost hope.", width / 2, height / 2);
    }

    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
      score++;
      if (lightRadius < 200) lightRadius += 5;
      if (bgBrightness < 100) bgBrightness += 2;
    }
  }

  drawLight();

  fill(255);
  textSize(16);
  text("Hope: " + score, 10, 20);
}

function drawLight() {
  noStroke();
  fill(255, 255, 100, 80);
  ellipse(player.x, player.y, lightRadius * 2);
}

class Player {
  constructor() {
    this.x = 100;
    this.y = height / 2;
    this.r = 20;
  }

  update() {
    if (kb.pressing('ArrowUp') || kb.pressing('w')) this.y -= 5;
    if (kb.pressing('ArrowDown') || kb.pressing('s')) this.y += 5;
    this.y = constrain(this.y, this.r, height - this.r);
  }

  show() {
    fill(255, 255, 200);
    ellipse(this.x, this.y, this.r * 2);
  }
}

class Obstacle {
  constructor() {
    this.x = width;
    this.w = 20;
    this.h = random(40, 150);
    this.y = random([0, height - this.h]);
    this.speed = 3;
  }

  update() {
    this.x -= this.speed;
  }

  show() {
    fill(50);
    rect(this.x, this.y, this.w, this.h);
  }

  hits(player) {
    return collideRectCircle(this.x, this.y, this.w, this.h, player.x, player.y, player.r * 2);
  }

  offscreen() {
    return this.x + this.w < 0;
  }
}
