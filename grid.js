'use strict';

const size = 30;
const walls = [
  [1, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [1, 6],
  [1, 7],
  [2, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [7, 1],
  [8, 1],
  [9, 1],
  [10, 1],
  [12, 1],
  [13, 1],
  [14, 1],
  [15, 1],
  [16, 1],
  [17, 1],
];

const seats = [[15, 15]];

Array.prototype.hasSquare = function([x1, y1]) {
  const present = this.find(([x, y]) => x === x1 && y === y1);
  return present;
};

class Grid {
  constructor() {
    this.height = 10;
    this.width = 10;
    this.squares = new Array(size).fill(
      new Array(size).fill({ occupied: false })
    );

    this.squares = this.squares.map((row, i) =>
      row.map((square, j) => ({
        occupied: walls.find(([x, y]) => x === i && y === j) ? true : false,
        seat: seats.find(([x, y]) => x === i && y === j) ? true : false,
      }))
    );
  }

  setSquareState([x, y], state) {
    this.squares[x][y].occupied = !!state;
  }

  getCurrentLocation(location) {
    return [
      Math.min(Math.floor(location.x / this.width), size - 1),
      Math.min(Math.floor(location.y / this.height), size - 1),
    ];
  }

  getSquareLocation([x, y]) {
    return new p5.Vector(
      x * this.width + this.width / 2,
      y * this.height + this.height / 2
    );
  }

  findRange([x, y], range) {
    var squares = [];
    const rows = size,
      cols = size;

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

  getVisibleSquares(currentSquare, visibilityRange) {
    const squares = this.findRange(currentSquare, visibilityRange);
    const availableSquares = squares.filter(
      ([x, y]) => !this.squares[x][y].occupied
    );
    return availableSquares.map(square => {
      const distance =
        Math.abs(currentSquare[0] - square[0]) +
        Math.abs(currentSquare[1] - square[1]);
      const seat = seats.find(([x, y]) => x === square[0] && y === square[1])
        ? true
        : false;
      return { coords: square, distance, seat };
    });
  }

  findPath(from, to) {
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
        if (this.squares[neighbor[0]][neighbor[1]].occupied) continue;
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

  // findPath(from, to) {
  //   const INFINITY = 1/0;
  //   const current = from;
  //   //mark all other nodes unvisited
  //   const visited = [];
  //   const unvisitedQueue =
  //   const distances = [];
  //   // get tentative distances of all neighbors to current
  //   // compare tenative distance (dist so far) to current value (infinity)
  //   // mark current node visited (never check again)
  //   // if destination node is visited, stop
  //   // select unvisited node with smallest distance, select as new current
  // }

  // findPath(from, to) {
  //   const paths = this.findRange(from, 1).map(neighbor => [from, neighbor]);
  //   this.getPath(paths, to);
  // }

  // getPath(lists, to) {
  //   lists.forEach(list => {
  //     const neighbors = this.findRange(list[list.length - 1], 1);
  //     const unvisited = neighbors.filter(
  //       ([x, y]) => !list.find(([x1, y1]) => x === x1 && y === y1)
  //     );
  //     const nextSearches = unvisited.map(next => [...list, next]);
  //     const containsTo = nextSearches.filter(search => {
  //       return (
  //         search[search.length - 1][0] === to[0] &&
  //         search[search.length - 1][1] === to[1]
  //       );
  //       // return search.some(([x, y]) => {
  //       //   return x === to[0] && y === to[1];
  //       // });
  //     });
  //     if (containsTo.length) {
  //       return;
  //     } else {
  //       this.getPath(nextSearches, to);
  //     }
  //   });
  // }

  draw() {
    fill(255);
    this.squares.forEach((row, i) => {
      row.forEach((square, j) => {
        let c = square.occupied ? 0 : 255;
        c = square.path ? color(255, 0, 0) : c;
        c = square.seat ? color(0, 255, 0) : c;
        fill(c);
        rect(i * this.height, j * this.width, this.height, this.width);
      });
    });
  }
}
