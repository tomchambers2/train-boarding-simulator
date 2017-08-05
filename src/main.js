import p5 from './p5.min.js';

window.p5 = p5;

import Flock from './flock';
import Grid from './grid';
import Agent from './agent';
import data from './data';

const flock = new Flock();
const grid = new Grid(data);
const numAgents = 10;

window.setup = () => {
  createCanvas(640, 360);

  for (var i = 0; i < numAgents; i++) {
    flock.add(
      new Agent(
        i + 1,
        grid.getSquareLocation([16, 11]),
        { disability: 0.1 },
        grid
      )
    );
  }
};

function mouseClicked() {
  grid.setPoint({ x: mouseX, y: mouseY }, 'occupied');
}

window.draw = () => {
  background(255);
  grid.draw();
  flock.run();
};
