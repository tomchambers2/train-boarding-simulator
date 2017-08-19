// @flow

import * as PIXI from 'pixi.js';

import Flock from './flock';
import Grid from './grid';
import Agent from './agent';
import Vector from './vector';
import data from './data';

const flock = new Flock();
const startingAgents = 0;

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

    // $FlowFixMe
    document.body.addEventListener('click', evt => {
      if (evt.shiftKey) {
        grid.setFeature(window.type || 'wall', [
          evt.clientX - 10,
          evt.clientY - 10,
        ]);
      } else {
        flock.add(
          new Agent(
            1,
            new Vector(evt.clientX, evt.clientY),
            { capability: 0.2 },
            grid,
            stage
          )
        );
      }
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
