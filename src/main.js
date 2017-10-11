// @flow

import * as PIXI from 'pixi.js';
import $ from 'jquery';

let debug = true;

import Flock from './flock';
import Grid from './grid';
import Agent from './agent';
import Vector from './vector';
import data from './data';

const flock = new Flock();
const startingAgents = 0;

let totalAgents = startingAgents;

const spawnPoints = [new Vector(180, 80), new Vector(550, 80)];

let type = 'wall';
let capability = 0.5;
let searchRange = 5;

let stage = 0;

const startTimer = () => {
  setTimeout(startTimer, data.stages[stage]);
  switch (stage) {
    case 0:
      console.log('train enters - agents go to platform/stay on train');
      // loop over agents and set all to 'wait at [[x,x],[x,x]]' for places on platform
      flock.shiftBoarded('-100%', 4000);
      $('.moving-parts').css({ right: '-100%' });
      $('.moving-parts').animate({ right: 0 }, 4000);
      break;
    case 1:
      console.log('train boarding - agents to find seat/leave to exit point');
      flock.board();
      break;
    case 2:
      console.log('train leaving - agents to go to platform/stay on train');
      flock.wait();
      flock.shiftBoarded('-100%', 4000);
      $('.moving-parts').animate({ right: '100%' }, 4000, () => {
        flock.killBoarded();
        flock.shiftBoarded('200', 0);
      });
      break;
  }
  stage = (stage + 1) % 3;
};

document.addEventListener(
  'DOMContentLoaded',
  () => {
    startTimer();

    const renderer = PIXI.autoDetectRenderer(
      data.canvasWidth,
      data.canvasHeight,
      { transparent: true }
    );
    // $FlowFixMe
    document.getElementById('render').appendChild(renderer.view);
    // renderer.backgroundColor = 0xffffff;
    var stage = new PIXI.Container();

    const types = evt => {
      type = evt.target.value;
    };

    $('.debug-toggle').click(() => {
      console.log('toggle debug');
      debug = !debug;
    });

    // $FlowFixMe
    document
      .getElementById('type-selector-1')
      .addEventListener('change', types);
    // $FlowFixMe
    document
      .getElementById('type-selector-2')
      .addEventListener('change', types);
    // $FlowFixMe
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

    document.getElementById('capability').defaultValue = capability;
    document.getElementById('capability').addEventListener('change', evt => {
      capability = evt.target.value;
    });

    document.getElementById('search-range').defaultValue = searchRange;
    document.getElementById('search-range').addEventListener('change', evt => {
      searchRange = evt.target.value;
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
          { capability, searchRange },
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
