import p5 from './p5.min.js';

window.p5 = p5;

import Flock from './flock';
import Grid from './grid';
import Agent from './agent';
import data from './data';

const flock = new Flock();
const grid = new Grid(data);
const numAgents = 0;

window.setup = () => {
  createCanvas(640, 360);

  for (var i = 0; i < numAgents; i++) {
    flock.add(
      new Agent(
        i + 1,
        grid.getSquareLocation([16, 11]),
        { capability: Math.random() },
        grid
      )
    );
  }
};

window.mouseClicked = () => {
  // grid.setPoint({ x: mouseX, y: mouseY }, 'occupied');
  flock.add(new Agent(1, { x: mouseX, y: mouseY }, { disability: 0.1 }, grid));
};

window.draw = () => {
  background(255);
  grid.draw();
  flock.run();
};
