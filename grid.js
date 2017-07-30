'use strict';

const size = 30;
const walls = [[1, 1], [1, 2]];

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
    return new p5.Vector(x * this.width, y * this.height);
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

  getVisibleSquares(currentSquare) {
    return this.findRange(currentSquare, 3);
  }

  findPath(from, to) {
    const open = [from];
    const closed = [];
    const cameFrom = {};
    cameFrom[from] = null;

    while (open.length) {
      // for A* add heuristic here to find next best path
      // const currentSquare = open.sort((a, b) => a.score - b.score).shift();
      const currentSquare = open.shift();
      closed.push(currentSquare);
      if (closed.hasSquare(to)) {
        let prev = closed.pop();
        const path = [prev];
        while (prev !== null) {
          prev = cameFrom[prev];
          path.unshift(prev);
        }
        for (const p of path) {
          if (p === null) {
            continue;
          }
          this.squares[p[0]][p[1]].occupied = true;
        }
        break;
      }
      const neighbors = this.findRange(currentSquare, 1);
      for (const neighbor of neighbors) {
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
        let color = square.occupied ? 0 : 255;
        // color = square.searching ? 50 : color;
        fill(color);
        rect(i * this.height, j * this.width, this.height, this.width);
      });
    });
  }
}
