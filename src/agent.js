// @flow

const SLOWING_DISTANCE = 10;

import p5 from './p5.min.js';

import Grid from './grid';

window.p5 = p5;

const random = (min, max) => Math.random() * (max - min) + min;

import type { Square, Coords, Vector } from './types';

export default class Agent {
  // parameters: {};
  // grid: Grid;
  // id: number;
  // targetPath: Array<Coords>;
  // radius: number;
  // maxSpeed: number;
  // maxForce: number;
  // arrived: boolean;
  // color: number;
  // capability: number;
  // tiredness: number;
  // journeyLength: number;
  // position: Vector;
  // target: Vector;
  // acceleration: Vector;
  // velocity: Vector;
  // parameters: {};
  // currentSquare: Coords;

  constructor(
    id: number,
    { x, y }: Vector,
    parameters: {
      capability: number,
      tiredness: number,
      journeyLength: number,
    },
    grid: Grid
  ) {
    this.parameters = parameters;
    this.id = id;
    this.position = new p5.Vector(x, y);
    this.target = new p5.Vector(0, 0);
    this.targetPath = [];
    this.grid = grid;
    this.currentSquare = null;

    this.acceleration = new p5.Vector(0, 0);
    this.velocity = new p5.Vector(random(-1, 1), random(-1, 1));
    this.radius = 3;
    this.maxSpeed = random(5, 20); // 2
    this.maxForce = 0.2; // 0.2

    this.arrived = false;

    this.color = random(200, 255);

    this.capability = Math.random();
    this.tiredness = Math.random();
    this.journeyLength = Math.random();
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
    // debugger;
    if (this.arrived) return;

    if (!this.targetPath.length && !this.arrived) {
      const targetSquare = this.findTargetFrom(this.currentSquare, 5);
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

  scoreSquare(coords: Coords) {
    // let score = square.distance / this.parameters.disability;
    // score += square.isSeat * this.parameters.tiredness;
    let score = 0;
    const square = this.grid.getSquare(coords);
    if (square.seat) score += 2;
    if (square.standing) score += 1;
    // if (this.grid.getSquare(this.currentSquare).seat) score = 0; // if in a seat, higher threshold
    // console.log(score);
    return { coords, score };
  }

  findTargetFrom(from: Coords, range: number) {
    return this.grid
      .getAccessibleNeighbors(from, range)
      .map(this.scoreSquare.bind(this))
      .sort((a, b) => b.score - a.score)[0].coords;
  }

  findTargetPath(from: Coords, to: Coords) {
    return this.grid.findPath(from, to);
  }

  applyForce(force: Vector) {
    this.acceleration.add(force);
  }

  seek(target: Coords) {
    const desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);
    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  arrive(velocity: Vector) {
    const desired = p5.Vector.sub(this.target, this.position);
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
  //   const steer = new p5.Vector(0, 0, 0);
  //   let count = 0;
  //   for (const other of agents) {
  //     const distance = p5.Vector.dist(this.position, other.position);
  //     if (distance > 0 && distance < desiredSeparation) {
  //       const diff = p5.Vector.sub(this.position, other.position);
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
  //   const sum = new p5.Vector(0, 0);
  //   let count = 0;
  //   for (const other of agents) {
  //     const distance = p5.Vector.dist(this.position, other.position);
  //     if (distance > 0 && distance < neighborDist) {
  //       sum.add(other.velocity);
  //       count++;
  //     }
  //   }
  //   if (count > 0) {
  //     sum.div(count);
  //     sum.normalize();
  //     sum.mult(this.maxSpeed);
  //     const steer = p5.Vector.sub(sum, this.velocity);
  //     steer.limit(this.maxForce);
  //     return steer;
  //   } else {
  //     return new p5.Vector(0, 0);
  //   }
  // }
  //
  // cohesion(agents) {
  //   const neighborDist = 50;
  //   const sum = new p5.Vector(0, 0);
  //   let count = 0;
  //   for (const other of agents) {
  //     const distance = p5.Vector.dist(this.position, other.position);
  //     if (distance > 0 && distance < neighborDist) {
  //       sum.add(other.position);
  //       count++;
  //     }
  //   }
  //   if (count > 0) {
  //     sum.div(count);
  //     return this.seek(sum);
  //   } else {
  //     return new p5.Vector(0, 0);
  //   }
  // }
}
