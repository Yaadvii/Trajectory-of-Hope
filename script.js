let player;
let obstacles = [];
let score = 0;
let bgBrightness = 0;
let meteor = null;
let celestialObjects = [];

function setup() {
  createCanvas(600, 400);
  player = new Player();
  obstacles.push(new Obstacle());
  
  // Create fixed celestial objects at strategic positions
  celestialObjects = [
    new CelestialObject(50, 60),
    new CelestialObject(150, 30),
    new CelestialObject(280, 80),
    new CelestialObject(420, 45),
    new CelestialObject(520, 90),
    new CelestialObject(80, 220),
    new CelestialObject(200, 180),
    new CelestialObject(350, 200),
    new CelestialObject(480, 250),
    new CelestialObject(550, 320),
    new CelestialObject(30, 350),
    new CelestialObject(120, 300),
    new CelestialObject(250, 340),
    new CelestialObject(380, 360),
    new CelestialObject(450, 180),
    new CelestialObject(320, 280)
  ];
}

function draw() {
  background(bgBrightness);

  player.update();
  player.show();

  if (frameCount % 60 === 0) {
    obstacles.push(new Obstacle());
  }

  // Update and show celestial objects
  for (let star of celestialObjects) {
    star.update();
    star.show();
  }

  // Create meteor at specific scores with random positions for fair collision chances
  let meteorScores = [2, 5, 7, 13, 15, 17, 19, 22, 26, 33, 38, 41];
  
  if (meteorScores.includes(score) && meteor === null) {
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
      
      // End game at score 50
      if (score >= 50) {
        noLoop();
        fill(0, 255, 0);
        textSize(32);
        textAlign(CENTER);
        text("You reached maximum hope!", width / 2, height / 2);
        fill(255);
        textSize(16);
        text("Final Score: " + score, width / 2, height / 2 + 40);
      }
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
    this.x = random(50, width - 50); // Random x position with margins
    this.y = 0; // Start from top
    this.r = 12; // Meteor radius
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

class CelestialObject {
  constructor(x, y) {
    // Fixed position
    this.x = x;
    this.y = y;
    
    // Star properties
    this.r = random(1, 2.5);
    this.twinkle = random(150, 255);
    this.twinkleSpeed = random(0.015, 0.04);
    this.twinkleOffset = random(0, TWO_PI); // Random starting phase for varied twinkling
  }

  update() {
    // Only update twinkling effect
    this.twinkle = 180 + sin(frameCount * this.twinkleSpeed + this.twinkleOffset) * 75;
    this.twinkle = constrain(this.twinkle, 80, 255);
  }

  show() {
    push();
    
    // Draw star shape with prominent points
    fill(255, 255, 200, this.twinkle);
    stroke(255, 255, 150, this.twinkle * 0.9);
    strokeWeight(1.2);
    
    // Create a 4-pointed star shape
    beginShape();
    // Top point
    vertex(this.x, this.y - this.r * 2);
    vertex(this.x - this.r * 0.3, this.y - this.r * 0.3);
    // Left point
    vertex(this.x - this.r * 2, this.y);
    vertex(this.x - this.r * 0.3, this.y + this.r * 0.3);
    // Bottom point
    vertex(this.x, this.y + this.r * 2);
    vertex(this.x + this.r * 0.3, this.y + this.r * 0.3);
    // Right point
    vertex(this.x + this.r * 2, this.y);
    vertex(this.x + this.r * 0.3, this.y - this.r * 0.3);
    endShape(CLOSE);
    
    // Add center glow
    fill(255, 255, 200, this.twinkle * 0.8);
    noStroke();
    ellipse(this.x, this.y, this.r * 0.8);
    
    // Subtle outer glow effect
    fill(255, 255, 200, this.twinkle * 0.1);
    ellipse(this.x, this.y, this.r * 6);
    
    pop();
  }
}