'use strict';

const flock = new Flock();
const numAgents = 30;

const seats = new Array(10).fill(null).map((val, i) => ({
  index: i,
  location: { x: i % 5 * 20 + 50, y: i > 5 ? 100 : 150 },
  occupied: false,
}));

function setup() {
  createCanvas(640, 360);
  for (var i = 0; i < numAgents; i++) {
    flock.add(new Boid(i + 1, { x: width / 2, y: height / 2 }, seats));
  }
}

function draw() {
  background(255);
  for (const seat of seats) {
    push();
    seat.occupied ? fill('red') : fill('green');
    ellipse(seat.location.x, seat.location.y, 10);
    pop();
  }
  flock.run();
}
