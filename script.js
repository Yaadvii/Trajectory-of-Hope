let player;
let obstacles = [];
let score = 0;
let bgBrightness = 0;
let meteor = null;

function setup() {
  createCanvas(600, 400);
  player = new Player();
  obstacles.push(new Obstacle());
}

function draw() {
  background(bgBrightness);

  player.update();
  player.show();

  if (frameCount % 60 === 0) {
    obstacles.push(new Obstacle());
  }

  // Create meteor at scores 2, 15, 5, 7, 19, 22, 26
  if ((score === 2 || score === 15 || score === 5 || score === 7 || score === 19 || score === 22 || score === 26) && meteor === null) {
    meteor = new Meteor();
  }

  // Update and show meteor
  if (meteor) {
    meteor.update();
    meteor.show();

    if (meteor.hits(player)) {
      noLoop(); // Game Over
      fill(255, 0, 0);
      textSize(32);
      textAlign(CENTER);
      text("You lost hope.", width / 2, height / 2);
    }

    if (meteor.offscreen()) {
      meteor = null;
    }
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
      player.grow(0.5);
      if (bgBrightness < 100) bgBrightness += 2;
    }
  }

  fill(255);
  textSize(16);
  text("Hope: " + score, 10, 20);
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

  grow(amount) {
    this.r += amount;
  }

  show() {
    if (!this.starSprite) {
      // Create pixel art star pattern
      let starPattern = `
....y...,
...yyy...
..yyyyy..
.yyyyyyy.
yyyyyyyyy
.yyyyyyy.
..yyyyy..
...yyy...
....y...,`;

      // Create the pixel art sprite
      this.starSprite = spriteArt(starPattern, 3);
    }

    // Draw the pixel art star
    push();
    translate(this.x, this.y);

    // Scale the star based on its radius
    let scaleAmount = this.r / 20; // 20 is the initial radius
    scale(scaleAmount);

    // Add glow effect
    drawingContext.shadowColor = 'yellow';
    drawingContext.shadowBlur = 15;

    // Draw the star sprite
    imageMode(CENTER);
    image(this.starSprite, 0, 0);

    // Reset shadow
    drawingContext.shadowBlur = 0;

    pop();
  }
}

class Obstacle {
  constructor() {
    this.x = width;
    this.w = 20;

    // 30% chance to create a tall obstacle that reaches height/2
    if (random() < 0.3) {
      this.h = height / 2; // 200 pixels tall
    } else {
      this.h = random(40, 150);
    }

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

class Meteor {
  constructor() {
    this.x = width / 2; // Fixed x position at center
    this.y = 0; // Start from top
    this.r = 10; // Meteor radius
    this.speed = 4;
    this.flameParticles = [];

    // Create initial flame particles
    for (let i = 0; i < 8; i++) {
      this.flameParticles.push({
        x: 0,
        y: 0,
        size: random(3, 8),
        alpha: random(150, 255)
      });
    }
  }

  update() {
    this.y += this.speed;

    // Update flame particles
    for (let particle of this.flameParticles) {
      particle.x = random(-this.r * 0.8, this.r * 0.8);
      particle.y = random(-this.r * 1.5, -this.r * 0.5);
      particle.alpha = random(100, 255);
    }
  }

  show() {
    push();
    translate(this.x, this.y);

    // Draw flame trails
    for (let particle of this.flameParticles) {
      // Orange flame
      fill(255, 140, 0, particle.alpha * 0.8);
      noStroke();
      ellipse(particle.x, particle.y, particle.size);

      // Yellow highlights
      fill(255, 255, 0, particle.alpha * 0.6);
      ellipse(particle.x, particle.y, particle.size * 0.6);
    }

    // Draw meteor body
    fill(80, 50, 30); // Dark brown/black meteor
    stroke(255, 100, 0); // Orange glow outline
    strokeWeight(2);
    ellipse(0, 0, this.r * 2);

    // Add meteor surface details
    fill(120, 80, 50);
    noStroke();
    ellipse(-5, -3, 6);
    ellipse(7, 2, 4);
    ellipse(-2, 8, 5);

    pop();
  }

  hits(player) {
    let distance = dist(this.x, this.y, player.x, player.y);
    return distance < (this.r + player.r);
  }

  offscreen() {
    return this.y - this.r > height;
  }
}