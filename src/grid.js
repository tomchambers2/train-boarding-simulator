// @flow

Array.prototype.hasSquare = function([x1, y1]) {
  const present = this.find(([x, y]) => x === x1 && y === y1);
  return present;
};

import type { Data, Square, Coords } from './types';

export default class Grid {
  constructor(data: Data) {
    this.height = this.width = data.squareDimension;
    this.size = data.size;
    const squareTemplate = {
      wall: false,
      seat: false,
      standing: false,
      occupied: false,
      occupier: null,
    };
    this.squares = new Array(data.size).fill(
      new Array(data.size).fill(data.size)
    );

    this.squares = this.squares.map(column =>
      column.map(row => ({
        ...squareTemplate,
      }))
    );

    data.standingSpaces.forEach((coords: Coords) =>
      this.setup(coords, 'standing', true)
    );
    data.seats.forEach((coords: Coords) => this.setup(coords, 'seat', true));
    data.walls.forEach((coords: Coords) => this.setup(coords, 'wall', true));
  }

  coordsMatch(a: Coords, b: Coords) {
    return a[0] === b[0] && a[1] === b[1];
  }

  getSquare([x, y]: Coords): Square {
    return { ...this.squares[x][y] };
  }

  setup([x, y]: Coords, property: string, state: boolean) {
    if (!['wall', 'seat', 'standing'].includes(property)) return;
    this.squares[x][y] = { ...this.squares[x][y], [property]: state };
  }

  updateSquare([x, y]: Coords, state: boolean, agentId: number) {
    this.squares[x][y].occupied = !!state;
    this.squares[x][y].occupier = agentId;
  }

  // setPoint(location, type) {
  //   const node = this.getCurrentLocation(location);
  //   data.standingSpaces.push(node);
  //   this.squares[node[0]][node[1]]['standingSpace'] = true;
  //   console.log(JSON.stringify(data.standingSpaces));
  // }

  getSquareByPixels([x, y]: Coords) {
    return [
      Math.min(Math.floor(x / this.width), this.size - 1),
      Math.min(Math.floor(y / this.height), this.size - 1),
    ];
  }

  getSquareLocation([x, y]: Coords) {
    return new p5.Vector(
      x * this.width + this.width / 2,
      y * this.height + this.height / 2
    );
  }

  findRange([x, y]: Coords, range: number) {
    var squares = [];
    const rows = this.size,
      cols = this.size;

    const starty = Math.max(0, y - range);
    const endy = Math.min(rows - 1, y + range);

    for (let row = starty; row <= endy; row++) {
      const xrange = range - Math.abs(row - y);

      const startx = Math.max(0, x - xrange);
      const endx = Math.min(cols - 1, x + xrange);

      for (let col = startx; col <= endx; col++) {
        squares.push([col, row]);
      }
    }

    return squares;
  }

  isBlocked(coords: Coords) {
    const square = this.getSquare(coords);
    return square.wall || square.occupied || square.seat;
  }

  getAccessibleNeighbors(square: Coords, range: number) {
    const squares = this.findRange(square, range);
    const availableSquares = squares.filter(coords => {
      const testSquare = this.getSquare(coords);
      return testSquare.seat || testSquare.standing;
    });
    return availableSquares;
  }

  findPath(from: Coords, to: Coords) {
    const open = [from];
    const closed = [];
    const cameFrom = {};
    cameFrom[from] = null;
    const path = [];

    while (open.length) {
      // for A* add heuristic here to find next best path
      // const currentSquare = open.sort((a, b) => a.score - b.score).shift();
      const currentSquare = open.shift();
      closed.push(currentSquare);
      if (closed.hasSquare(to)) {
        let prev = closed.pop();
        path.push(prev);
        while (prev !== null) {
          prev = cameFrom[prev];
          path.unshift(prev);
        }
        for (const p of path) {
          if (p === null) {
            continue;
          }
          this.squares[p[0]][p[1]].path = true;
        }
        break;
      }
      const neighbors = this.findRange(currentSquare, 1);
      for (const neighbor of neighbors) {
        if (this.isBlocked(neighbor) && !this.coordsMatch(neighbor, to))
          continue;
        this.squares[neighbor[0]][neighbor[1]].searching = true;
        if (closed.hasSquare(neighbor)) continue;
        if (!open.hasSquare(neighbor)) {
          open.push(neighbor);
          cameFrom[neighbor] = currentSquare;
        } else {
          // test score to see if better than parent
        }
      }
    }
    path.shift();
    return path;
  }

  draw() {
    fill(255);
    this.squares.forEach((row, i) => {
      row.forEach((square, j) => {
        let c = 255;
        c = square.wall ? color(0, 0, 0) : c;
        c = square.seat ? color(0, 255, 0) : c;
        c = square.standing ? color(0, 0, 255) : c;
        c = square.path ? color(255, 0, 0) : c;
        c = square.occupied ? 0 : c;
        fill(c);
        rect(i * this.height, j * this.width, this.height, this.width);
      });
    });
  }
}
