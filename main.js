'use strict';

const flock = new Flock();

function setup() {
  createCanvas(640, 360);
  for (var i = 0; i < 50; i++) {
    flock.add(new Boid(width / 2, height / 2));
  }
}

function draw() {
  background(255);
  flock.run();
}
