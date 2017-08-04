'use strict';

const size = 30;
const walls = [
  [9, 2],
  [5, 2],
  [6, 2],
  [8, 2],
  [7, 2],
  [10, 2],
  [11, 2],
  [13, 2],
  [15, 2],
  [12, 2],
  [14, 2],
  [16, 2],
  [18, 2],
  [19, 2],
  [17, 2],
  [20, 2],
  [22, 2],
  [21, 2],
  [23, 2],
  [24, 2],
  [4, 2],
  [4, 3],
  [4, 5],
  [4, 4],
  [4, 6],
  [4, 7],
  [4, 8],
  [25, 2],
  [26, 2],
  [27, 2],
  [28, 2],
  [29, 2],
  [29, 3],
  [29, 4],
  [29, 5],
  [29, 6],
  [29, 8],
  [29, 7],
  [4, 9],
  [5, 9],
  [7, 9],
  [8, 9],
  [13, 9],
  [18, 9],
  [19, 9],
  [21, 9],
  [20, 9],
  [22, 9],
  [14, 9],
  [23, 9],
  [24, 9],
  [26, 9],
  [27, 9],
  [28, 9],
  [29, 9],
  [25, 9],
  [12, 9],
  [10, 9],
  [9, 9],
  [6, 9],
  [11, 9],
];

const seats = [
  [15, 15],
  [5, 3],
  [5, 4],
  [5, 6],
  [5, 7],
  [7, 3],
  [7, 4],
  [8, 4],
  [8, 3],
  [7, 6],
  [7, 7],
  [8, 7],
  [8, 6],
  [10, 6],
  [10, 7],
  [11, 7],
  [11, 6],
  [10, 3],
  [10, 4],
  [11, 4],
  [11, 3],
  [13, 3],
  [13, 4],
  [13, 6],
  [13, 7],
  [15, 3],
  [15, 4],
  [15, 6],
  [15, 7],
  [18, 3],
  [18, 4],
  [18, 6],
  [18, 7],
  [20, 7],
  [20, 6],
  [20, 4],
  [20, 3],
  [21, 3],
  [21, 4],
  [21, 6],
  [21, 7],
  [23, 7],
  [23, 6],
  [23, 3],
  [23, 4],
  [24, 3],
  [24, 4],
  [24, 6],
  [24, 7],
  [26, 7],
  [26, 6],
  [26, 4],
  [26, 3],
  [28, 3],
  [28, 4],
  [28, 6],
  [28, 7],
];
const standingSpaces = [
  [16, 15],
  [6, 5],
  [7, 5],
  [8, 5],
  [9, 5],
  [10, 5],
  [11, 5],
  [12, 5],
  [13, 5],
  [14, 5],
  [15, 5],
  [17, 5],
  [16, 5],
  [16, 4],
  [16, 3],
  [17, 3],
  [17, 4],
  [16, 6],
  [16, 7],
  [17, 7],
  [17, 6],
  [18, 5],
  [19, 5],
  [20, 5],
  [21, 5],
  [22, 5],
  [23, 5],
  [23, 5],
  [23, 5],
  [24, 5],
  [25, 5],
  [26, 5],
  [27, 5],
];

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
        standingSpace: standingSpaces.find(([x, y]) => x === i && y === j)
          ? true
          : false,
      }))
    );
  }

  setSquareState([x, y], state, agentId) {
    this.squares[x][y].occupied = !!state;
    this.squares[x][y].occupiedBy = agentId;
  }

  setPoint(location, type) {
    const node = this.getCurrentLocation(location);
    standingSpaces.push(node);
    this.squares[node[0]][node[1]]['standingSpace'] = true;
    console.log(JSON.stringify(standingSpaces));
  }

  // setPoint(location, type) {
  //   const node = this.getCurrentLocation(location);
  //   walls.push(node);
  //   this.squares[node[0]][node[1]][type] = true;
  //   console.log(JSON.stringify(walls));
  // }

  getSquareInfo([x1, y1]) {
    return {
      occupiedBy: this.squares[x1][y1].occupiedBy,
      occupied:
        this.squares[x1][y1].occupied ||
        walls.find(([x, y]) => x === x1 && y === y1)
          ? true
          : false,
      seat: seats.find(([x, y]) => x === x1 && y === y1) ? true : false,
      standingSpace: standingSpaces.find(([x, y]) => x === x1 && y === y1)
        ? true
        : false,
    };
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
      const standingSpace = standingSpaces.find(
        ([x, y]) => x === square[0] && y === square[1]
      )
        ? true
        : false;
      return { coords: square, distance, seat, standingSpace };
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
        let c = 255;
        c = square.seat ? color(0, 255, 0) : c;
        c = square.standingSpace ? color(0, 0, 255) : c;
        c = square.path ? color(255, 0, 0) : c;
        c = square.occupied ? 0 : c;
        fill(c);
        rect(i * this.height, j * this.width, this.height, this.width);
      });
    });
  }
}
