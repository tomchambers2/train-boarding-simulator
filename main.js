'use strict';

const flock = new Flock();

function setup() {
  createCanvas(640, 360);
  for (var i = 0; i < 50; i++) {
    flock.add(
      new Boid(
        { x: width / 2, y: height / 2 },
        { x: random(width), y: random(height) }
      )
    );
  }
}

function draw() {
  background(255);
  flock.run();
}
