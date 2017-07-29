'use strict';

const size = 100;
const walls = [[1, 1], [1, 2]];

class Grid {
  constructor() {
    this.height = 10;
    this.width = 10;
    this.columns = new Array(size).fill(
      new Array(size).fill({ occupied: false })
    );

    this.columns = this.columns.map((row, i) =>
      row.map((square, j) => ({
        occupied: walls.find(([x, y]) => x === i && y === j) ? true : false,
      }))
    );
  }

  setSquareState([x, y], state) {
    this.columns[x][y].occupied = !!state;
  }

  getCurrentLocation(location) {
    return [
      Math.min(Math.floor(location.x / this.width), size - 1),
      Math.min(Math.floor(location.y / this.height), size - 1),
    ];
  }

  getSquareLocation([x, y]) {
    return new p5.Vector(x * this.width, y * this.height);
  }

  draw() {
    fill(255);
    this.columns.forEach((row, i) => {
      row.forEach((square, j) => {
        const color = square.occupied ? 0 : 255;
        fill(color);
        rect(i * this.height, j * this.width, this.height, this.width);
      });
    });
  }
}
