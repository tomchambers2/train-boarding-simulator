// @flow

const SLOWING_DISTANCE = 10;

import p5 from './p5.min.js';

import Grid from './grid';
import Vector from './vector';

window.p5 = p5;

const random = (min, max) => Math.random() * (max - min) + min;

import type { Square, Coords } from './types';

export default class Agent {
  grid: Grid;
  id: number;
  targetPath: Array<Coords>;
  radius: number;
  maxSpeed: number;
  maxForce: number;
  arrived: boolean;
  color: number;
  position: Vector;
  target: Vector;
  acceleration: Vector;
  velocity: Vector;
  parameters: {
    capability: number,
  };
  currentSquare: Coords;

  constructor(
    id: number,
    { x, y }: Vector,
    parameters: {
      capability: number,
    },
    grid: Grid
  ) {
    this.parameters = parameters;
    this.id = id;
    this.position = new Vector(x, y);
    this.target = new Vector(0, 0);
    this.targetPath = [];
    this.grid = grid;
    this.currentSquare = null;

    this.acceleration = new Vector(0, 0);
    this.velocity = new Vector(random(-1, 1), random(-1, 1));
    this.radius = 3;
    // this.maxSpeed = parameters.capability * 4; // 2
    this.maxSpeed = 2;
    this.maxForce = 0.2; // 0.2

    this.arrived = false;

    this.color = random(200, 255);
  }

  log(msg: string) {
    if (this.id !== 1) return;
    console.log(msg, 'background: #222; color: #bada55');
  }

  run(agents: Array<Agent>) {
    // this.flock(agents);
    this.moveAgent();
    this.applyForce(this.seek(this.target));
    this.updateGridLocation();
    this.selectTarget();

    this.borders();
    this.render();
  }

  moveAgent() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.velocity = this.arrive(this.velocity); // couldnt match square, too far away
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  unsetOldPosition() {
    this.grid.updateSquare(this.currentSquare, false, this.id);
  }

  updateGridLocation() {
    if (this.currentSquare) this.unsetOldPosition();
    this.currentSquare = this.grid.getSquareByPixels([
      this.position.x,
      this.position.y,
    ]);
    this.grid.updateSquare(this.currentSquare, true, this.id);
  }

  selectTarget() {
    if (this.arrived) return;

    if (!this.targetPath.length && !this.arrived) {
      const targetSquare = this.findTargetFrom(this.currentSquare, 5);
      if (!targetSquare) return;
      this.targetPath = this.findTargetPath(this.currentSquare, targetSquare);
      return;
    }

    const destination = this.grid.getSquare(
      this.targetPath[this.targetPath.length - 1]
    );
    if (destination.occupied && destination.occupier !== this.id) {
      this.targetPath = [];
      return;
    }

    if (this.grid.coordsMatch(this.targetPath[0], this.currentSquare)) {
      this.targetPath.shift();
      if (!this.targetPath.length) this.arrived = true;
      return;
    }

    this.target = this.grid.getSquareLocation(this.targetPath[0]);
  }

  rand(max: number) {
    return Math.floor(Math.random() * max);
  }

  scoreSquare(origin: Coords) {
    return (coords: Coords) => {
      let score = 0;
      // let score = square.distance / this.parameters.disability;
      // score += square.isSeat * this.parameters.tiredness;
      const distance = this.grid.distanceBetween(origin, coords);
      score -= distance * (1 - this.parameters.capability);

      const nearby = this.grid.agentsNearSquare(coords);
      score -= nearby * 2;

      const square = this.grid.getSquare(coords);
      if (square.seat) score += 2;
      if (square.standing) score += 1;
      // if (this.grid.getSquare(this.currentSquare).seat) score = 0; // if in a seat, higher threshold
      // console.log(score);
      return { coords, score };
    };
  }

  findTargetFrom(from: Coords, range: number) {
    const destination = this.grid
      .getAccessibleNeighbors(from, range)
      .map(this.scoreSquare.bind(this)(from))
      .sort((a, b) => b.score - a.score)[0];
    return (destination && destination.coords) || null;
  }

  findTargetPath(from: Coords, to: Coords) {
    return this.grid.findPath(from, to);
  }

  applyForce(force: Vector) {
    this.acceleration.add(force);
  }

  seek(target: Coords) {
    const desired = Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);
    const steer = Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  arrive(velocity: Vector) {
    const desired = Vector.sub(this.target, this.position);
    const distance = desired.mag();
    if (distance < SLOWING_DISTANCE) {
      const mag = map(distance, 0, 100, 0, this.maxSpeed);
      desired.setMag(mag);
      return desired;
    }
    return velocity;
  }

  flock(agents: Array<Agent>) {
    // const separation = this.separate(agents);
    // separation.mult(1.5);
    // this.applyForce(separation);
    // const alignment = this.align(agents);
    // alignment.mult(1);
    // this.applyForce(alignment);
    // const cohesion = this.cohesion(agents);
    // cohesion.mult(1);
    // this.applyForce(cohesion);
  }

  borders() {
    if (this.position.x < -this.radius) this.position.x = width + this.radius;
    if (this.position.y < -this.radius) this.position.y = height + this.radius;
    if (this.position.x > width + this.radius) this.position.x = -this.radius;
    if (this.position.y > height + this.radius) this.position.y = -this.radius;
  }

  render() {
    const theta = this.velocity.heading() + radians(90);
    push();
    fill(color(this.color));
    stroke(0);
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape(TRIANGLES);
    vertex(0, -this.radius * 2);
    vertex(-this.radius, this.radius * 2);
    vertex(this.radius, this.radius * 2);
    endShape();
    rotate(-theta);
    textSize(18);
    fill(0);
    pop();
  }

  // separate(agents) {
  //   const desiredSeparation = 25;
  //   const steer = new Vector(0, 0, 0);
  //   let count = 0;
  //   for (const other of agents) {
  //     const distance = Vector.dist(this.position, other.position);
  //     if (distance > 0 && distance < desiredSeparation) {
  //       const diff = Vector.sub(this.position, other.position);
  //       diff.normalize();
  //       diff.div(distance);
  //       steer.add(diff);
  //       count++;
  //     }
  //   }
  //   if (count > 0) {
  //     steer.div(count);
  //   }
  //   if (steer.mag() > 0) {
  //     steer.normalize();
  //     steer.mult(this.maxSpeed);
  //     steer.sub(this.velocity);
  //     steer.limit(this.maxForce);
  //   }
  //   return steer;
  // }
  //
  // align(agents) {
  //   const neighborDist = 50;
  //   const sum = new Vector(0, 0);
  //   let count = 0;
  //   for (const other of agents) {
  //     const distance = Vector.dist(this.position, other.position);
  //     if (distance > 0 && distance < neighborDist) {
  //       sum.add(other.velocity);
  //       count++;
  //     }
  //   }
  //   if (count > 0) {
  //     sum.div(count);
  //     sum.normalize();
  //     sum.mult(this.maxSpeed);
  //     const steer = Vector.sub(sum, this.velocity);
  //     steer.limit(this.maxForce);
  //     return steer;
  //   } else {
  //     return new Vector(0, 0);
  //   }
  // }
  //
  // cohesion(agents) {
  //   const neighborDist = 50;
  //   const sum = new Vector(0, 0);
  //   let count = 0;
  //   for (const other of agents) {
  //     const distance = Vector.dist(this.position, other.position);
  //     if (distance > 0 && distance < neighborDist) {
  //       sum.add(other.position);
  //       count++;
  //     }
  //   }
  //   if (count > 0) {
  //     sum.div(count);
  //     return this.seek(sum);
  //   } else {
  //     return new Vector(0, 0);
  //   }
  // }
}
