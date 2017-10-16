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

const spawnPoints = [new Vector(100, 30), new Vector(400, 30)];
// const spawnPoints = [new Vector(180, 80), new Vector(550, 80)];

let type = 'wall';
let capability = 0.5;
let searchRange = 5;

let stage = 0;

const startTimer = () => {
  setTimeout(startTimer, data.stages[stage]);
  switch (stage) {
    case 0:
      flock.shiftBoarded('-100%', 4000);
      $('.moving-parts').css({ right: '-100%' });
      $('.moving-parts').animate({ right: 0 }, 4000);
      break;
    case 1:
      flock.board();
      break;
    case 2:
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

const formatVector = (vector: Vector) => {
  return `${vector.x}, ${vector.y}`;
};

const updateDebugger = () => {
  const debugAgent = flock.get(0);
  if (!debugAgent) return;
  $('.dead').html(debugAgent.dead);
  $('.boarded').html(debugAgent.boarded);
  $('.arrived').html(debugAgent.arrived);
  $('.id').html(debugAgent.id);
  $('.position').html(formatVector(debugAgent.position));
  $('.target').html(formatVector(debugAgent.target));
  $('.target-path').html(JSON.stringify(debugAgent.targetPath));
  $('.current-square').html(JSON.stringify(debugAgent.currentSquare));
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

    // const createAgents = () => {
    //   grid.create(stage);
    //
    //   for (var i = 0; i < startingAgents; i++) {
    //     flock.add(
    //       new Agent(
    //         i + 1,
    //         grid.getSquareLocation([16, 11]),
    //         { capability: Math.random() },
    //         grid,
    //         stage
    //       )
    //     );
    //   }
    // };

    const draw = () => {
      requestAnimationFrame(draw);
      flock.run();
      grid.run();
      updateDebugger();
      renderer.render(stage);
    };

    // createAgents();

    requestAnimationFrame(draw);
  },
  false
);
