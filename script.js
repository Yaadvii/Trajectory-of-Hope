
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
    // Draw the main star
    this.drawStar(this.x, this.y, this.r * 0.8, this.r * 1.6, 5);
    
    // Add shine effect with smaller bright star on top
    push();
    translate(this.x - this.r * 0.3, this.y - this.r * 0.3);
    fill(255, 255, 255, 180);
    this.drawStar(0, 0, this.r * 0.3, this.r * 0.6, 5);
    pop();
  }

  drawStar(x, y, radius1, radius2, npoints) {
    push();
    translate(x, y);
    
    // Main star body - golden yellow
    fill(255, 215, 0);
    stroke(255, 255, 150);
    strokeWeight(1);
    
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = cos(a) * radius2;
      let sy = sin(a) * radius2;
      vertex(sx, sy);
      sx = cos(a + halfAngle) * radius1;
      sy = sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
    pop();
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
