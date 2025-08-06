
let player, obstacles = [], score = 0, bgBrightness = 0, meteor = null;
let celestialObjects = [], saturn = null, jupiter = null, planetVisible = false;

function setup() {
  createCanvas(600, 400);
  player = new Player();
  obstacles.push(new Obstacle());

  // Fixed star positions
  let starPositions = [
    [50, 60], [150, 30], [280, 80], [420, 45], [520, 90],
    [80, 220], [200, 180], [350, 200], [480, 250], [550, 320],
    [30, 350], [120, 300], [250, 340], [380, 360], [450, 180], [320, 280]
  ];
  celestialObjects = starPositions.map(pos => new CelestialObject(pos[0], pos[1]));
  spawnPlanet();
}

function draw() {
  background(bgBrightness);
  
  player.update();
  player.show();
  
  if (frameCount % 60 === 0) obstacles.push(new Obstacle());

  // Update and show celestial objects
  celestialObjects.forEach(star => { 
    star.update(); 
    star.show(); 
  });

  // Handle planets
  [saturn, jupiter].forEach((planet, i) => {
    if (planet) {
      planet.update();
      planet.show();
      if (planet.offscreen()) {
        if (i === 0) saturn = null;
        else jupiter = null;
        planetVisible = false;
      }
    }
  });

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
  let x = random(50, width - 50);
  let y = height + 50;
  if (random() < 0.5) {
    saturn = new Planet('saturn', x, y);
  } else {
    jupiter = new Planet('jupiter', x, y);
  }
  planetVisible = true;
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
  text("Congratulations! You've discovered that hope isn't just", width / 2, height / 2 - 60);
  text("about reaching the destination - it's about growing", width / 2, height / 2 - 40);
  text("stronger with every challenge you face.", width / 2, height / 2 - 20);
  text("You overcame all obstacles and your light", width / 2, height / 2 + 10);
  text("now shines brightest in the cosmos!", width / 2, height / 2 + 30);
  fill(255, 255, 200);
  textSize(16);
  text("Final Score: " + score, width / 2, height / 2 + 60);
}

class Player {
  constructor() {
    this.x = 100;
    this.y = height / 2;
    this.r = 10;
  }

  update() {
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) this.y -= 5; // W key
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) this.y += 5; // S key
    this.y = constrain(this.y, this.r, height - this.r);
  }

  grow(amount) {
    this.r += amount;
  }

  show() {
    push();
    translate(this.x, this.y);
    
    // Create glow effect
    drawingContext.shadowColor = 'yellow';
    drawingContext.shadowBlur = 15;
    
    // Draw star shape
    fill(255, 255, 200);
    stroke(255, 255, 150);
    strokeWeight(1.2);
    
    let r = this.r;
    beginShape();
    vertex(0, -r * 2);
    vertex(-r * 0.3, -r * 0.3);
    vertex(-r * 2, 0);
    vertex(-r * 0.3, r * 0.3);
    vertex(0, r * 2);
    vertex(r * 0.3, r * 0.3);
    vertex(r * 2, 0);
    vertex(r * 0.3, -r * 0.3);
    endShape(CLOSE);
    
    // Center circle
    fill(255, 255, 200);
    noStroke();
    ellipse(0, 0, r * 0.8);
    
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
    this.stones = this.createStones();
  }

  createStones() {
    let stones = [];
    let currentY = this.y + this.h;
    let stoneHeight = 0;

    while (stoneHeight < this.h) {
      let stone = {
        x: this.x + random(-8, 8),
        y: currentY - random(12, 20),
        w: random(15, 25),
        h: random(12, 18),
        rotation: random(0, TWO_PI),
        color: random(['#4a4a4a', '#5a5a5a', '#3a3a3a', '#6a6a6a'])
      };
      stones.push(stone);
      currentY = stone.y;
      stoneHeight += stone.h;
    }
    return stones;
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
      
      // Simple highlight
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
  }

  update() {
    this.y += this.speed;
  }

  show() {
    push();
    translate(this.x, this.y);
    
    // Simple flame effect
    for (let i = 0; i < 6; i++) {
      let flameX = random(-this.r * 0.8, this.r * 0.8);
      let flameY = random(-this.r * 1.5, -this.r * 0.5);
      fill(255, 140, 0, random(100, 200));
      noStroke();
      ellipse(flameX, flameY, random(3, 8));
    }
    
    // Meteor body
    fill(80, 50, 30);
    stroke(255, 100, 0);
    strokeWeight(2);
    ellipse(0, 0, this.r * 2);
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

    let r = this.r;
    beginShape();
    vertex(this.x, this.y - r * 2);
    vertex(this.x - r * 0.3, this.y - r * 0.3);
    vertex(this.x - r * 2, this.y);
    vertex(this.x - r * 0.3, this.y + r * 0.3);
    vertex(this.x, this.y + r * 2);
    vertex(this.x + r * 0.3, this.y + r * 0.3);
    vertex(this.x + r * 2, this.y);
    vertex(this.x + r * 0.3, this.y - r * 0.3);
    endShape(CLOSE);

    fill(255, 255, 200, this.twinkle * 0.8);
    noStroke();
    ellipse(this.x, this.y, r * 0.8);
    pop();
  }
}

class Planet {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.speed = random(0.5, 1.2);
    this.r = type === 'saturn' ? random(15, 20) : random(18, 25);
    this.color = type === 'saturn' ? color(255, 215, 140) : color(200, 150, 100);
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
      // Saturn rings
      noFill();
      stroke(200, 200, 200, 150);
      strokeWeight(2);
      ellipse(this.x, this.y, this.r * 2.8);
      strokeWeight(1);
      ellipse(this.x, this.y, this.r * 3.2);
    } else {
      // Jupiter stripes
      noFill();
      stroke(150, 100, 60, 120);
      strokeWeight(1.5);
      for (let i = -2; i <= 2; i++) {
        arc(this.x, this.y + i * this.r * 0.4, this.r * 1.8, this.r * 0.3, 0, PI);
      }
    }
    pop();
  }

  offscreen() {
    return this.y + this.r < 0;
  }
}
