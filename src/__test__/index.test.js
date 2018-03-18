jest.mock('pixi.js', () => {
  Graphics: () => {};
});

import Agent from '../agent';

describe('Flock', () => {
  it('should run each agent');
  it('should add an agent');
});
