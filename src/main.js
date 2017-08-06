// @flow

import * as PIXI from 'pixi.js';

import Flock from './flock';
import Grid from './grid';
import Agent from './agent';
import data from './data';
import Vector from './vector';

const flock = new Flock();
const numAgents = 0;

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const renderer = PIXI.autoDetectRenderer(
      data.canvasWidth,
      data.canvasHeight
    );
    // $FlowFixMe
    document.body.appendChild(renderer.view);
    var stage = new PIXI.Container();

    // $FlowFixMe
    document.body.addEventListener('click', evt => {
      if (evt.shiftKey) {
        grid.setFeature(window.type || 'wall', [evt.clientX, evt.clientY]);
      } else {
        flock.add(
          new Agent(
            1,
            new Vector(evt.clientX, evt.clientY),
            { disability: 0.1 },
            grid,
            stage
          )
        );
      }
    });

    const grid = new Grid(data, stage);

    const createAgents = () => {
      grid.create(stage);

      for (var i = 0; i < numAgents; i++) {
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
      flock.run();
      renderer.render(stage);
      requestAnimationFrame(draw);
    };

    createAgents();

    requestAnimationFrame(draw);
  },
  false
);
