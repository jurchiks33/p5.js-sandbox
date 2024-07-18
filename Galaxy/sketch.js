let cols, rows;
let scl = 20;
let w = 5400;
let h = 1200;
let flying = 0;
let terrain = [];
let stars = [];
let comets = [];
let planets = [];
let planetTextures = [];

const MIN_DISTANCE = 475;  // 1/4th of the screen width (1900 / 4)
const MIN_HORIZONTAL_DISTANCE = 475;  // Minimum horizontal distance

function preload() {
  // Load planet textures
  planetTextures[0] = loadImage('planet1.jpg');
  planetTextures[1] = loadImage('planet2.jpg');
  planetTextures[2] = loadImage('planet3.jpg');
}

function setup() {
  createCanvas(1900, 900, WEBGL);
  cols = w / scl;
  rows = h / scl;
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0; // Initialize terrain
    }
  }
  // Initialize stars
  for (let i = 0; i < 500; i++) {
    stars.push({
      x: random(-width, width),
      y: random(-height, height),
      z: random(width)
    });
  }
  // Initialize comets
  for (let i = 0; i < 10; i++) {  // Increased the number of comets
    comets.push(createComet());
  }
  // Initialize planets
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {  // Delay planet creation
      planets.push(createPlanet(i % 3));  // Use different textures for planets
    }, random(2000, 10000));
  }
}

function draw() {
  flying -= 0.1;
  let yoff = flying;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      terrain[x][y] = map(noise(xoff, yoff), 0, 1, -100, 100);
      xoff += 0.2;
    }
    yoff += 0.2;
  }

  background(0);
  drawStars();
  drawComets();
  drawPlanets();
  drawTerrain();
}

function drawStars() {
  push();
  translate(-width / 2, -height / 2);
  for (let star of stars) {
    let sx = map(star.x / star.z, 0, 1, 0, width);
    let sy = map(star.y / star.z, 0, 1, 0, height);
    let r = map(star.z, 0, width, 5, 0);
    noStroke();
    fill(255);
    ellipse(sx, sy, r, r);

    star.z -= 2;
    if (star.z < 1) {
      star.z = width;
      star.x = random(-width, width);
      star.y = random(-height, height);
    }
  }
  pop();
}

function drawTerrain() {
  push();
  translate(width / 2, height / 2 + 50);
  rotateX(PI / 3);
  translate(-w / 2, -h / 2);
  stroke(255);  // Add stroke for grid lines
  noFill();  // Ensure no fill for grid
  for (let y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      vertex(x * scl, y * scl, terrain[x][y]);
      vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
    }
    endShape();
  }
  pop();
}

function createComet() {
  return {
    x: random(-width, width),
    y: random(-height, 0),  // Spawn only in the top half
    z: random(width),
    speed: random(10, 50),
    tail: [],
  };
}

function drawComets() {
  push();
  translate(-width / 2, -height / 2);
  for (let i = comets.length - 1; i >= 0; i--) {
    let comet = comets[i];
    let cx = map(comet.x / comet.z, 0, 1, 0, width);
    let cy = map(comet.y / comet.z, 0, 1, 0, height);
    let r = map(comet.z, 0, width, 10, 0);
    noStroke();  // Remove stroke for comets
    fill(255, 255, 255, 150);
    ellipse(cx, cy, r, r);

    // Draw tail
    comet.tail.push({ x: cx, y: cy });
    if (comet.tail.length > 10) {
      comet.tail.shift();
    }
    for (let j = 0; j < comet.tail.length; j++) {
      fill(255, 150 - j * 15);
      ellipse(comet.tail[j].x, comet.tail[j].y, r - j, r - j);
    }

    comet.z -= comet.speed;
    if (comet.z < 1) {
      comets.splice(i, 1);  // Remove comet from array
      comets.push(createComet());  // Add a new comet
    }
  }
  pop();
}

function createPlanet(index) {
  let newPlanet;
  let attempts = 0;
  do {
    newPlanet = {
      x: random(-width / 2, width / 2),
      y: random(-height, 0),  // Spawn only in the top half
      size: random(70, 350),  // Increased the minimum size
      texture: planetTextures[index],
      z: random(-width * 2, -width),  // Start far away
      rotationSpeed: random(0.01, 0.05),  // Random rotation speed
      rotationAngle: 0  // Initial rotation angle
    };
    attempts++;
  } while (!isFarEnough(newPlanet) && attempts < 100);

  return newPlanet;
}

function isFarEnough(newPlanet) {
  for (let planet of planets) {
    let horizontalDist = abs(newPlanet.x - planet.x);
    if (horizontalDist < MIN_HORIZONTAL_DISTANCE) {
      return false;
    }
    let d = dist(newPlanet.x, newPlanet.y, planet.x, planet.y);
    if (d < MIN_DISTANCE) {
      return false;
    }
  }
  return true;
}

function drawPlanets() {
  for (let i = planets.length - 1; i >= 0; i--) {
    let planet = planets[i];
    push();
    translate(planet.x, planet.y, planet.z);
    noStroke();  // Remove stroke for planets
    texture(planet.texture);
    rotateY(planet.rotationAngle);  // Apply rotation
    sphere(planet.size);
    planet.z += 2;  // Move towards the viewer
    planet.rotationAngle += planet.rotationSpeed;  // Update rotation angle
    if (planet.z > width) {  // Move past the viewer
      planets.splice(i, 1);  // Remove planet from array
      planets.push(createPlanet(planets.length % 3));  // Add a new planet
    }
    pop();
  }
}
