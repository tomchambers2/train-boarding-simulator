// @flow
import * as PIXI from 'pixi.js';

import type { Data, Square, Coords } from './types';

import Vector from './vector';

export default class Grid {
  height: number;
  width: number;
  gridDimensions: {
    width: number,
    height: number,
  };
  squares: Array<Square>;
  added: Array<Coords>;
  debug: boolean;

  /* Stuff */
  constructor(data: Data, stage: PIXI.Container) {
    this.height = this.width = data.squareDimension;
    this.gridDimensions = data.gridDimensions;
    this.debug = data.debug;
    this.stage = stage;

    const squareTemplate = {
      wall: false,
      seat: false,
      standing: false,
      occupied: false,
      occupier: null,
    };
    this.squares = new Array(data.gridDimensions.width).fill(
      new Array(data.gridDimensions.height).fill(data.gridDimensions.height)
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

  // SETUP
  setup([x, y]: Coords, property: string, state: boolean) {
    if (!['wall', 'seat', 'standing'].includes(property)) return;
    this.squares[x][y] = { ...this.squares[x][y], [property]: state };
  }

  create(stage: PIXI.Container) {
    if (!this.debug) return;
    this.stage = stage;
    this.squares.forEach((row, i) => {
      row.forEach((square, j) => {
        let c = 0x000000;
        c = square.wall ? 0x000000 : c;
        c = square.seat ? 0x00ff00 : c;
        c = square.standing ? 0x0000ff : c;
        // c = square.path && this.debug ? 0xff0000 : c;
        // c = square.occupied && this.debug ? 0x000000 : c;

        if (square.wall || square.seat || square.standing) {
          const rectangle = new PIXI.Graphics();
          const lineWidth = this.debug ? 1 : 0;
          rectangle.lineStyle(lineWidth, 0x000000, 1);
          rectangle.beginFill(c);
          rectangle.initialColor = c;
          rectangle.drawRect(0, 0, this.height, this.width);
          rectangle.endFill();
          rectangle.x = i * this.height;
          rectangle.y = j * this.width;
          stage.addChild(rectangle);
          this.squares[i][j].rectangle = rectangle;
        }

        this.squares[i][j].message = new PIXI.Text(null, {
          fontFamily: 'Arial',
          fontSize: 7,
          fill: 'white',
        });
        this.squares[i][j].message.text = `${i},${j}`;
        this.squares[i][j].message.x = i * this.height;
        this.squares[i][j].message.y = j * this.width;
        // FIXME somehow make square numbers work better
        // stage.addChild(this.squares[i][j].message);

        // fill(c);
        // const s = this.debug ? 0 : 255;
        // stroke(s);
        // rect(i * this.height, j * this.width, this.height, this.width);
      });
    });
  }

  // UTILITY/ACCESSOR
  coordsMatch(a: Coords, b: Coords) {
    return a[0] === b[0] && a[1] === b[1];
  }

  distanceBetween(a: Coords, b: Coords) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }

  getSquare([x, y]: Coords): Square {
    return { ...this.squares[x][y] };
  }

  getSquareByPixels([x, y]: Coords) {
    const location = [
      Math.min(Math.floor(x / this.width), this.gridDimensions.width - 1),
      Math.min(Math.floor(y / this.height), this.gridDimensions.height - 1),
    ];
    return location;
  }

  getSquareLocation([x, y]: Coords) {
    return new Vector(
      x * this.width + this.width / 2,
      y * this.height + this.height / 2
    );
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

  // ACTIONS, updates, setting things
  updateSquare([x, y]: Coords, state: boolean, agentId: number) {
    this.squares[x][y].occupied = !!state;
    this.squares[x][y].occupier = agentId;
  }

  updateSquareScore([x, y]: Coords, score: number) {
    this.squares[x][y].score = score;
    // this.squares[x][y].message.text = score;
  }

  setFeature(type: string, location: Coords) {
    const square = this.getSquareByPixels(location);
    this.squares[square[0]][square[1]][type] = !this.squares[square[0]][
      square[1]
    ][type];
    this.added = this.added || [];
    this.added.push(square);
    console.info(JSON.stringify(this.added));

    let c;
    c = type === 'wall' ? 0x000000 : c;
    c = type === 'seat' ? 0x00ff00 : c;
    c = type === 'standing' ? 0x0000ff : c;

    let rectangle;
    if (this.squares[square[0]][square[1]].rectangle) {
      rectangle = this.squares[square[0]][square[1]].rectangle;
    } else {
      rectangle = new PIXI.Graphics();
      const lineWidth = this.debug ? 1 : 0;
      this.squares[square[0]][square[1]].rectangle = rectangle;
      rectangle.x = square[0] * this.height;
      rectangle.y = square[1] * this.width;
    }
    rectangle.lineStyle(0.5, 0x000000, 1);
    rectangle.beginFill(c);
    rectangle.drawRect(0, 0, this.height, this.width);
    rectangle.endFill();
    this.stage.addChild(rectangle);
  }

  changeSquareColor(to: Coords) {
    const lineWidth = this.debug ? 1 : 0;
    this.squares[to[0]][to[1]].rectangle &&
      this.squares[to[0]][to[1]].rectangle.clear();
    if (!this.squares[to[0]][to[1]].rectangle) {
      this.squares[to[0]][to[1]].rectangle = new PIXI.Graphics();
      this.stage.addChild(this.squares[to[0]][to[1]].rectangle);
    }
    this.squares[to[0]][to[1]].rectangle.lineStyle(lineWidth, 0x000000, 1);
    this.squares[to[0]][to[1]].rectangle.beginFill(0x00ff00);
    this.squares[to[0]][to[1]].rectangle.drawRect(
      0,
      0,
      this.height,
      this.width
    );
    this.squares[to[0]][to[1]].rectangle.endFill();
    this.squares[to[0]][to[1]].rectangle.x = to[0] * this.height;
    this.squares[to[0]][to[1]].rectangle.y = to[1] * this.width;
  }

  // BIG ONES
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

  findPath(from: Coords, to: Coords) {
    if (this.debug) this.squares[to[0]][to[1]].nextColor = 0xeeff0c;

    const open = [from];
    const closed = [];
    const cameFrom = {};
    cameFrom[from] = null;
    const path = [];

    while (open.length) {
      // TODO A* - add heuristic here to find next best path
      // const currentSquare = open.sort((a, b) => a.score - b.score).shift();
      const currentSquare = open.shift();
      if (this.debug)
        this.squares[currentSquare[0]][currentSquare[1]].nextColor = 0x00ff00;
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

  // ON FRAME FUNCTIONS
  run() {
    this.squares.forEach((row, i) => {
      row.forEach((square, j) => {
        if (this.squares[i][j].nextColor) {
          this.changeSquareColor([i, j]);
          if (
            this.squares[i][j].nextColor !== this.squares[i][j].initialColor
          ) {
            this.squares[i][j].nextColor =
              this.squares[i][j].initialColor || 0x000000;
          } else {
            this.squares[i][j].nextColor = null;
          }
        }
      });
    });
  }
}
