'use strict';

const flock = new Flock();
const grid = new Grid();
const numAgents = 0;

grid.findPath([10, 5], [25, 15]);

function setup() {
  createCanvas(640, 360);

  for (var i = 0; i < numAgents; i++) {
    flock.add(new Agent(i + 1, { x: width / 2, y: height / 2 }));
  }
}

function draw() {
  background(255);
  grid.draw();
  flock.run();
}
