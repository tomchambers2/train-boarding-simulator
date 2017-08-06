// @flow
import * as PIXI from 'pixi.js';

import type { Data, Square, Coords } from './types';

import Vector from './vector';

export default class Grid {
  height: number;
  width: number;
  size: number;
  squares: Array<Square>;
  added: Array<Coords>;
  debug: boolean;

  constructor(data: Data, stage) {
    this.height = this.width = data.squareDimension;
    this.size = data.size;
    this.debug = data.debug;

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

  distanceBetween(a: Coords, b: Coords) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
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

  setFeature(type: string, location: Coords) {
    const square = this.getSquareByPixels(location);
    this.squares[square[0]][square[1]][type] = true;
    this.added = this.added || [];
    this.added.push(square);
    console.log(JSON.stringify(this.added));
  }

  getSquareByPixels([x, y]: Coords) {
    return [
      Math.min(Math.floor(x / this.width), this.size - 1),
      Math.min(Math.floor(y / this.height), this.size - 1),
    ];
  }

  getSquareLocation([x, y]: Coords) {
    return new Vector(
      x * this.width + this.width / 2,
      y * this.height + this.height / 2
    );
  }

  findRange([i, j]: Coords, range: number) {
    const neighbors = [];
    const row_limit = this.squares.length - 1;
    if (row_limit > 0) {
      const column_limit = this.squares[0].length - 1;
      for (
        let x = Math.max(0, i - range);
        x <= Math.min(i + range, row_limit);
        x++
      ) {
        for (
          let y = Math.max(0, j - range);
          y <= Math.min(j + range, column_limit);
          y++
        ) {
          if (x != i || y != j) {
            neighbors.push([x, y]);
          }
        }
      }
    }
    return neighbors;
  }

  isBlocked(coords: Coords) {
    const square = this.getSquare(coords);
    return square.wall || square.occupied || square.seat;
  }

  agentsNearSquare(coords: Coords) {
    return this.findRange(coords, 1).filter(
      square => this.getSquare(square).occupied
    ).length;
  }

  getAccessibleNeighbors(square: Coords, range: number) {
    const squares = this.findRange(square, range);
    const availableSquares = squares.filter(coords => {
      const testSquare = this.getSquare(coords);
      return (testSquare.seat || testSquare.standing) && !testSquare.occupied;
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
      // TODO A* - add heuristic here to find next best path
      // const currentSquare = open.sort((a, b) => a.score - b.score).shift();
      const currentSquare = open.shift();
      closed.push(currentSquare);
      if (closed.some(other => this.coordsMatch(to, other))) {
        let prev = closed.pop();
        path.push(prev);
        while (prev !== null) {
          prev = cameFrom[prev.join()];
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
        if (closed.some(other => this.coordsMatch(neighbor, other))) continue;
        if (!open.some(other => this.coordsMatch(neighbor, other))) {
          open.push(neighbor);
          cameFrom[neighbor.join()] = currentSquare;
        } else {
          // TODO A* - test score to see if better than parent
        }
      }
    }
    path.shift();
    return path;
  }

  create(stage) {
    this.squares.forEach((row, i) => {
      row.forEach((square, j) => {
        let c = 0xffffff;
        c = square.wall ? 0x000000 : c;
        c = square.seat ? 0x00ff00 : c;
        c = square.standing ? 0x0000ff : c;
        c = square.path && this.debug ? 0xff0000 : c;
        c = square.occupied && this.debug ? 0x000000 : c;

        const rectangle = new PIXI.Graphics();
        rectangle.lineStyle(0.5, 0x000000, 1);
        rectangle.beginFill(c);
        rectangle.drawRect(0, 0, this.height, this.width);
        rectangle.endFill();
        rectangle.x = i * this.height;
        rectangle.y = j * this.width;
        stage.addChild(rectangle);

        // fill(c);
        // const s = this.debug ? 0 : 255;
        // stroke(s);
        // rect(i * this.height, j * this.width, this.height, this.width);
      });
    });
  }

  draw(stage) {
    // fill(255);
    this.squares.forEach((row, i) => {
      row.forEach((square, j) => {
        // let c = 255;
        // c = square.wall ? color(0, 0, 0) : c;
        // c = square.seat ? color(0, 255, 0) : c;
        // c = square.standing ? color(0, 0, 255) : c;
        // c = square.path && this.debug ? color(255, 0, 0) : c;
        // c = square.occupied && this.debug ? 0 : c;
        // fill(c);
        // const s = this.debug ? 0 : 255;
        // stroke(s);
        // rect(i * this.height, j * this.width, this.height, this.width);
      });
    });
  }
}
