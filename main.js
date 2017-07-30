'use strict';

const flock = new Flock();
const grid = new Grid();
const numAgents = 10;

// grid.findPath([10, 5], [25, 15]);

function setup() {
  createCanvas(640, 360);

  for (var i = 0; i < numAgents; i++) {
    flock.add(
      new Agent(i + 1, grid.getSquareLocation([16, 11]), { disability: 0.1 })
    );
  }
}

function mouseClicked() {
  grid.setPoint({ x: mouseX, y: mouseY }, 'occupied');
}

function draw() {
  background(255);
  grid.draw();
  flock.run();
}
