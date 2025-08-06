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
  
  // Create initial celestial objects
  for (let i = 0; i < 8; i++) {
    celestialObjects.push(new CelestialObject());
  }
}

function draw() {
  background(bgBrightness);

  player.update();
  player.show();

  if (frameCount % 60 === 0) {
    obstacles.push(new Obstacle());
  }

  // Update and show celestial objects
  for (let i = celestialObjects.length - 1; i >= 0; i--) {
    celestialObjects[i].update();
    celestialObjects[i].show();
    
    if (celestialObjects[i].offscreen()) {
      celestialObjects.splice(i, 1);
      celestialObjects.push(new CelestialObject());
    }
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
  constructor() {
    this.x = random(0, width);
    this.y = random(height + 50, height + 300); // Start below screen
    this.type = random(['star', 'planet']);
    this.speed = random(0.2, 0.8); // Very slow movement
    
    if (this.type === 'star') {
      this.r = random(1, 3);
      this.twinkle = random(150, 255);
      this.twinkleSpeed = random(0.02, 0.05);
    } else {
      this.r = random(8, 20);
      this.hue = random(200, 280); // Blue to purple range for space feel
      this.saturation = random(30, 80);
      this.brightness = random(40, 80);
    }
  }

  update() {
    this.y -= this.speed;
    
    if (this.type === 'star') {
      this.twinkle += sin(frameCount * this.twinkleSpeed) * 20;
      this.twinkle = constrain(this.twinkle, 100, 255);
    }
  }

  show() {
    push();
    
    if (this.type === 'star') {
      // Draw twinkling star
      fill(255, 255, 200, this.twinkle);
      noStroke();
      
      // Main star body
      ellipse(this.x, this.y, this.r * 2);
      
      // Star points
      stroke(255, 255, 200, this.twinkle * 0.7);
      strokeWeight(1);
      line(this.x - this.r * 2, this.y, this.x + this.r * 2, this.y);
      line(this.x, this.y - this.r * 2, this.x, this.y + this.r * 2);
      
    } else {
      // Draw planet with subtle colors
      colorMode(HSB);
      fill(this.hue, this.saturation, this.brightness, 180);
      noStroke();
      ellipse(this.x, this.y, this.r * 2);
      
      // Add subtle planet rings for larger planets
      if (this.r > 15) {
        noFill();
        stroke(this.hue, this.saturation * 0.5, this.brightness * 0.8, 100);
        strokeWeight(1);
        ellipse(this.x, this.y, this.r * 2.8);
      }
      
      colorMode(RGB);
    }
    
    pop();
  }

  offscreen() {
    return this.y + this.r < 0;
  }
}