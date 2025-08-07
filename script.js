
let player, obstacles = [], score = 0, meteor = null;
let celestialObjects = [], saturn = null, jupiter = null;
let gameState = 'welcome';
let saturnShown = false, jupiterShown = false;

function setup() {
  createCanvas(600, 400);
  player = new Player();
  obstacles.push(new Obstacle());

  // Generate random stars in the background
  celestialObjects = [];
  let numStars = 15;
  for (let i = 0; i < numStars; i++) {
    let x = random(10, width - 10);
    let y = random(10, height - 10);
    celestialObjects.push(new CelestialObject(x, y));
  }
}

function draw() {
  if (gameState == 'welcome') {
    showWelcomeScreen();
    return;
  }
  background(0); // Keep background black
  player.update();
  player.show();
  if (frameCount % 60 === 0) obstacles.push(new Obstacle()); //generating new obstacles every second

  // twinking of the stars 
  celestialObjects.forEach(star => { star.update(); star.show(); });
  // Planets go in once at specific scores
  if (score === 10 && !saturnShown) {
    saturn = new Planet('saturn', random(50, width - 50), height + 50);
    saturnShown = true;
  }
  if (score === 25 && !jupiterShown) {
    jupiter = new Planet('jupiter', random(50, width - 50), height + 50);
    jupiterShown = true;
  }
  updatePlanet(saturn, 'saturn');
  updatePlanet(jupiter, 'jupiter');
  // Meteors at fixed positions
  let meteorScores = [2, 5, 7, 13, 15, 17, 19, 22, 26, 33, 38, 41];
  if (meteorScores.includes(score) && !meteor) meteor = new Meteor();
  if (meteor) {
    meteor.update();
    meteor.show();
    if (meteor.hits(player)) gameOver("You faced a minor setback. Don't lose hope!");
    if (meteor.offscreen()) meteor = null;
  }
  // Handle obstacles - backwards loop for removal
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].show();

    if (obstacles[i].hits(player)) {
      gameOver("You faced an obstacle. Don't lose hope.");
    }
    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
      score++;
      if (score >= 50) {
        noLoop();
        showWinMessage();
      }
    }
  }
  // Score display
  fill(255);
  textSize(16);
  text("Obstacles overcome: " + score, 85, 20);
}

function updatePlanet(planet, type) {
  if (planet) {
    planet.update();//moves the planet up and out
    planet.show();
    if (planet.offscreen()) {
      if (type === 'saturn') saturn = null;
      else jupiter = null;
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
  text("Welcome.\n Use Up and Down arrow keys to \n avoid your star from running into the asteroid belts and the meteors.\n Remember, no matter what happens, don't lose hope", width / 2, height / 2-50);
  
  fill(200);
  textSize(16);
  text("Click anywhere to start your journey.", width / 2, height/2 +100);
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
      if (keyIsPressed && keyCode === UP_ARROW) this.y -= 5;
      if (keyIsPressed && keyCode === DOWN_ARROW) this.y += 5;
      this.y = constrain(this.y, this.r, height - this.r);
    }
  }
  
  show() {
    push();
    translate(this.x, this.y);
    
    drawingContext.shadowColor = 'white';
    drawingContext.shadowBlur = 15;
    
    fill(255, 255, 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(this.r * 3);
    text("★", 0, 0);

    drawingContext.shadowBlur = 0;
    pop();
  }
}
class Obstacle {
  constructor() {
    this.x = width;
    this.speed = 3;
    this.w = 40;
    this.h = random() < 0.3 ? height / 2 : random(100, 220);
    this.y = random([0, height - this.h]);
    
    // Create asteroid belt
    this.asteroids = [];
    let numLayers = Math.floor(this.h / 18) + 3;
    
    let asteroidColors = [
      { r: 80, g: 75, b: 70 },   // Dark gray
      { r: 95, g: 85, b: 75 },   // Brown-gray
      { r: 70, g: 65, b: 60 },   // Charcoal
      { r: 100, g: 90, b: 80 },  // Light brown
      { r: 65, g: 60, b: 55 }    // Dark brown
    ];
    
    for (let i = 0; i < numLayers; i++) {
      let layerY = this.y + (i * this.h / (numLayers - 1));
      let asteroidsInLayer = random(2, 4);
      
      for (let j = 0; j < asteroidsInLayer; j++) {
        let size = random(12, 28);
        let colorType = random(asteroidColors);
        let variation = random(-15, 15);
        
        this.asteroids.push({
          x: random(-8, 8),
          y: layerY + random(-8, 8),
          size: size,
          offsetX: random(-6, 6),
          color: {
            r: constrain(colorType.r + variation, 50, 130),
            g: constrain(colorType.g + variation, 45, 125),
            b: constrain(colorType.b + variation, 40, 120)
          },
          rotation: random(0, TWO_PI),
          rotationSpeed: random(-0.02, 0.02)
        });
      }
    }
  }

  update() {
    this.x -= this.speed;
    for (let asteroid of this.asteroids) {
      asteroid.x = this.x + asteroid.offsetX;
      asteroid.rotation += asteroid.rotationSpeed;
    }
  }

  show() {
    for (let asteroid of this.asteroids) {
      push();
      translate(asteroid.x, asteroid.y);
      rotate(asteroid.rotation);
      
      // Main asteroid body
      fill(asteroid.color.r, asteroid.color.g, asteroid.color.b);
      stroke(asteroid.color.r - 25, asteroid.color.g - 25, asteroid.color.b - 25);
      strokeWeight(1.5);
      ellipse(0, 0, asteroid.size);
      
      // Surface craters
      fill(asteroid.color.r - 20, asteroid.color.g - 20, asteroid.color.b - 20);
      noStroke();
      ellipse(-asteroid.size * 0.25, -asteroid.size * 0.15, asteroid.size * 0.35);
      ellipse(asteroid.size * 0.15, asteroid.size * 0.2, asteroid.size * 0.25);
      
      // Highlight for 3D effect
      fill(asteroid.color.r + 40, asteroid.color.g + 35, asteroid.color.b + 30, 180);
      ellipse(-asteroid.size * 0.2, -asteroid.size * 0.2, asteroid.size * 0.3);
      
      pop();
    }
  }

  hits(player) {
    for (let asteroid of this.asteroids) {
      let d = dist(player.x, player.y, asteroid.x, asteroid.y);
      if (d < (player.r + asteroid.size / 2)) {
        return true;
      }
    }
    return false;
  }

  offscreen() {
    return this.x + this.w < 0;
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
    this.r = random(0.8, 3.5); // Random size for each star
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
