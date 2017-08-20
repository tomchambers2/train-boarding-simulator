// @flow

import * as PIXI from 'pixi.js';

import Flock from './flock';
import Grid from './grid';
import Agent from './agent';
import Vector from './vector';
import data from './data';

const flock = new Flock();
const startingAgents = 0;

let totalAgents = startingAgents;

const spawnPoints = [
  new Vector(166, 100),
  new Vector(445, 94),
  new Vector(714, 105),
];

let type = 'wall';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const renderer = PIXI.autoDetectRenderer(
      data.canvasWidth,
      data.canvasHeight
    );
    // $FlowFixMe
    document.body.appendChild(renderer.view);
    renderer.backgroundColor = 0xffffff;
    var stage = new PIXI.Container();

    const types = evt => {
      type = evt.target.value;
    };

    // $FlowFixMe
    document
      .getElementById('type-selector-1')
      .addEventListener('change', types);
    document
      .getElementById('type-selector-2')
      .addEventListener('change', types);
    document
      .getElementById('type-selector-3')
      .addEventListener('change', types);

    // $FlowFixMe
    document.body.addEventListener('click', evt => {
      if (evt.shiftKey) {
        console.log('add feature', type);
        grid.setFeature(type || 'wall', [evt.clientX - 10, evt.clientY - 10]);
      }
    });

    // $FlowFixMe
    document.getElementById('new-agent').addEventListener('click', evt => {
      const pick = Math.ceil(Math.random() * spawnPoints.length) - 1;
      console.log(pick);
      const initialPosition = spawnPoints[pick];
      flock.add(
        new Agent(
          ++totalAgents,
          initialPosition,
          { capability: 0.5 },
          grid,
          stage
        )
      );
    });

    const grid = new Grid(data, stage);

    const createAgents = () => {
      grid.create(stage);

      for (var i = 0; i < startingAgents; i++) {
        flock.add(
          new Agent(
            i + 1,
            grid.getSquareLocation([16, 11]),
            { capability: Math.random() },
            grid,
            stage
          )
        );
      }
    };

    const draw = () => {
      requestAnimationFrame(draw);
      flock.run();
      renderer.render(stage);
    };

    createAgents();

    requestAnimationFrame(draw);
  },
  false
);
