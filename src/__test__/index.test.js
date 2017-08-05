import Grid from '../grid';
import Agent from '../agent';

describe('Grid', () => {
  let grid;

  beforeEach(() => {
    grid = new Grid({
      size: 10,
      walls: [[5, 2]],
      seats: [[4, 3]],
      standingSpaces: [[5, 3]],
      squareDimension: 10,
    });
  });

  it('should be constructed with size^2 squares', () => {
    expect(grid.squares.length * grid.squares[0].length).toBe(100);
  });

  it('should return an object with the state of a square from x y coords', () => {
    const square = grid.getSquare([0, 0]);
    expect(square).toHaveProperty('wall');
    expect(square).toHaveProperty('seat');
    expect(square).toHaveProperty('standing');
    expect(square).toHaveProperty('occupied');
    expect(square).toHaveProperty('occupier');
  });

  it('should return a copy of the object square', () => {
    const square = grid.getSquare([0, 0]);
    square.mutatedProperty = 'beef';
    expect(grid.getSquare([0, 0])).not.toHaveProperty('mutatedProperty');
  });

  it('should be constructed with configured squares', () => {
    expect(grid.getSquare([5, 2]).wall).toBe(true);
    expect(grid.getSquare([4, 3]).seat).toBe(true);
    expect(grid.getSquare([5, 3]).standing).toBe(true);

    expect(grid.getSquare([8, 1]).wall).toBe(false);
    expect(grid.getSquare([2, 2]).seat).toBe(false);
    expect(grid.getSquare([5, 4]).standing).toBe(false);
  });

  it('should set the configured state of an individual square', () => {
    grid.setup([6, 6], 'wall', true);
    expect(grid.getSquare([6, 6]).wall).toBe(true);
  });

  it.skip(
    'should save the configured state of a square to local storage',
    () => {
      expect(JSON.stringify(localStorage.getItem('grid')).toEqual(grid));
    }
  );

  it('should return the x y coords for given pixel coords', () => {
    expect(grid.getSquareByPixels([54, 67])).toEqual([5, 6]);
  });

  it('should calculate the manhattan distance between two squares', () => {
    expect(grid.distanceBetween([1, 1], [4, 4])).toBe(6);
  });

  it('should find all the squares around a square within a radius', () => {
    const result = grid.findRange([3, 3], 1);
    expect(result).toHaveLength(8);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([2, 2]),
        expect.arrayContaining([3, 2]),
        expect.arrayContaining([2, 3]),
        expect.arrayContaining([3, 3]),
        expect.arrayContaining([3, 4]),
        expect.arrayContaining([4, 2]),
        expect.arrayContaining([4, 3]),
        expect.arrayContaining([4, 4]),
      ])
    );
  });

  it('should find all the squares around a square within a radius', () => {
    const result = grid.findRange([3, 3], 2);
    expect(result).toHaveLength(24);
  });

  it('should find all the squares around a square within a radius', () => {
    const result = grid.findRange([1, 1], 2);
    expect(result).toHaveLength(15);
  });

  it('should find a path from A to B', () => {
    expect(grid.findPath([0, 0], [5, 6])).toEqual([
      [0, 0],
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ]);
  });

  it('should update the state of a square', () => {
    grid.updateSquare([1, 1], true, 1);
    expect(grid.squares[1][1]).toHaveProperty('occupied', true);
    expect(grid.squares[1][1]).toHaveProperty('occupier', 1);
  });

  it('should draw the grid onto the page if debug is turned on');
});

describe('Flock', () => {
  it('should run each agent');
  it('should add an agent');
});

describe('Agent', () => {
  let agent;
  let grid;

  beforeEach(() => {});

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
    };
    agent = new Agent(1, { x: 50, y: 50 }, { capability: 0.5 }, grid);

    expect(agent.scoreSquare([2, 2])([3, 5])).toEqual({
      coords: [3, 5],
      score: -2.5,
    });
  });
});
