
let player;
let obstacles = [];
let score = 0;
let bgBrightness = 0;
let backgroundStars = [];

function setup() {
  createCanvas(600, 400);
  player = new Player();
  obstacles.push(new Obstacle());
  
  // Generate random background stars
  for (let i = 0; i < 15; i++) {
    backgroundStars.push({
      x: random(width),
      y: random(height),
      size: random(8, 20)
    });
  }
}

function draw() {
  background(bgBrightness);
  
  // Draw background stars
  drawBackgroundStars();

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
      player.grow(0.5);
      if (bgBrightness < 100) bgBrightness += 2;
    }
  }

  fill(255);
  textSize(16);
  text("Hope: " + score, 10, 20);
}

function drawBackgroundStars() {
  fill(255);
  noStroke();
  
  for (let i = 0; i < backgroundStars.length; i++) {
    let star = backgroundStars[i];
    if (i % 2 === 0) {
      draw4PointStar(star.x, star.y, star.size);
    } else {
      drawSnowflake(star.x, star.y, star.size);
    }
  }
}

function draw4PointStar(x, y, size) {
  push();
  translate(x, y);
  beginShape();
  
  // Create a 4-pointed star
  for (let i = 0; i < 8; i++) {
    let angle = TWO_PI / 8 * i - PI/2;
    let radius = (i % 2 === 0) ? size : size * 0.3;
    let starX = cos(angle) * radius;
    let starY = sin(angle) * radius;
    vertex(starX, starY);
  }
  
  endShape(CLOSE);
  pop();
}

function drawSnowflake(x, y, size) {
  push();
  translate(x, y);
  stroke(255);
  strokeWeight(1);
  
  // Draw 6 lines from center for snowflake pattern
  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI / 6 * i;
    let endX = cos(angle) * size;
    let endY = sin(angle) * size;
    line(0, 0, endX, endY);
    
    // Add small branches
    let branchSize = size * 0.3;
    let branchX = cos(angle) * branchSize;
    let branchY = sin(angle) * branchSize;
    
    // Left branch
    let leftAngle = angle - PI/4;
    line(branchX, branchY, branchX + cos(leftAngle) * branchSize * 0.5, branchY + sin(leftAngle) * branchSize * 0.5);
    
    // Right branch  
    let rightAngle = angle + PI/4;
    line(branchX, branchY, branchX + cos(rightAngle) * branchSize * 0.5, branchY + sin(rightAngle) * branchSize * 0.5);
  }
  
  pop();
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
