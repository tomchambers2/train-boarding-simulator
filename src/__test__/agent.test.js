jest.mock('pixi.js', () => {
  Graphics: () => {};
});

import Agent from '../agent';

describe('Agent', () => {
  Agent.prototype.createDrawing = jest.fn();

  let agent;
  let grid;

  beforeEach(() => {
    agent = null;
    grid = null;
  });

  describe('#shift', () => {
    it('should call shiftStep() with the calculated result', () => {
      agent = new Agent(1, { x: 50, y: 50 }, { capability: 0.5 }, grid);
      const inner = jest.fn(() => {});
      agent.shiftStep = jest.fn(() => inner);
      agent.shift(100, 1000);
      expect(agent.shiftStep).toBeCalledWith(1.6);
      expect(inner).toBeCalled();
    });
  });

  describe('#shiftStep', () => {
    it('should increment offsetX by the correct amount', () => {
      agent = new Agent(1, { x: 50, y: 50 }, { capability: 0.5 }, grid);
      agent.movement = {
        timeStep: 16,
        movedDistance: 0,
        totalDistance: 0,
      };
      agent.shiftStep();
    });
  });

  it('should be constructed with the correct setup');
  it('should execute the correct actions on update');
  it('should find a destination if it has not found one yet');
  it('should score a square by internal rubric', () => {
    grid = {
      getSquare: () => ({
        standing: true,
      }),
      distanceBetween: () => 1,
      agentsNearSquare: () => 2,
      updateSquareScore: jest.fn(),
    };
    agent = new Agent(1, { x: 50, y: 50 }, { capability: 0.5 }, grid);

    expect(agent.scoreSquare([2, 2])([0, 0])).toEqual({
      coords: [0, 0],
      score: -3.5,
    });
  });

  it('should find a target based on scoring');

  it('should score a square by internal rubric', () => {
    grid = {
      getSquare: () => ({
        seat: true,
      }),
      distanceBetween: () => 1,
      agentsNearSquare: () => 2,
      updateSquareScore: jest.fn(),
    };
    agent = new Agent(1, { x: 50, y: 50 }, { capability: 0.5 }, grid);

    expect(agent.scoreSquare([2, 2])([3, 5])).toEqual({
      coords: [3, 5],
      score: -2.5,
    });
  });
});
