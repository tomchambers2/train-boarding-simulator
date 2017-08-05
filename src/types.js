export type Data = {
  walls: Array<Array<number>>,
  seats: Array<Array<number>>,
  standingSpaces: Array<Array<number>>,
  size: number,
  squareDimension: number,
};

export type Square = {
  wall: boolean,
  seat: boolean,
  standing: boolean,
  occupied: boolean,
  occupier: ?number,
};

export type Vector = { x: number, y: number };

export type Coords = Array<number>;
