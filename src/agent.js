// @flow

const SLOWING_DISTANCE = 10;

import * as PIXI from 'pixi.js';

import Grid from './grid';
import Vector from './vector';
import data from './data';

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
  canvasWidth: number;
  canvasHeight: number;

  constructor(
    id: number,
    { x, y }: Vector,
    parameters: {
      capability: number,
    },
    grid: Grid,
    stage
  ) {
    if (!parameters || !parameters.capability) {
      throw new Error('Must have capability parameter');
    }

    this.dead = false;
    this.parameters = parameters;
    this.id = id;
    this.position = new Vector(x, y);
    this.target = new Vector(x, y);
    this.targetPath = [];
    this.grid = grid;
    this.currentSquare = null;
    this.canvasWidth = data.canvasWidth;
    this.canvasHeight = data.canvasHeight;

    this.acceleration = new Vector(0, 0);
    this.velocity = new Vector(random(-1, 1), random(-1, 1));
    this.radius = 3;
    // this.maxSpeed = parameters.capability * 4; // 2
    this.maxSpeed = 2;
    this.maxForce = 0.2; // 0.2

    this.maxSearchArea = 5;

    this.arrived = false;

    this.createDrawing(stage);
  }

  createDrawing(stage) {
    this.color = random(200, 255);

    this.rectangle = new PIXI.Graphics();
    this.rectangle.lineStyle(4, 0xff3300, 1);
    this.rectangle.beginFill(0x66ccff);
    this.rectangle.drawRect(0, 0, this.radius, this.radius);
    this.rectangle.endFill();
    this.rectangle.x = this.position.x;
    this.rectangle.y = this.position.y;
    stage.addChild(this.rectangle);
  }

  log(msg: string) {
    if (this.id !== 1) return;
    console.log(msg, 'background: #222; color: #bada55');
  }

  run(agents: Array<Agent>) {
    if (this.dead) return; // TODO: use a timer to efficiently research space
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

  stop() {
    this.dead = true;
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
  }

  selectTarget() {
    if (this.arrived) return;

    if (!this.targetPath.length && !this.arrived) {
      const targetSquare = this.findTargetFrom(
        this.currentSquare,
        this.maxSearchArea
      );
      if (!targetSquare) {
        console.log('THERE IS NO TARGET, STOP');
        this.stop();
        return;
      }
      console.log('TARGET IS', targetSquare);
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
      const square = this.grid.getSquare(coords);

      const distance = this.grid.distanceBetween(origin, coords);
      const distanceScore =
        (1 - distance / (this.maxSearchArea * 2)) * this.parameters.capability; // higher disability, more important distant is

      const nearby = this.grid.agentsNearSquare(coords);
      const nearbyScore = 1 - nearby / 8;

      let typeScore;
      if (square.seat)
        typeScore = this.map(1 - this.parameters.capability, 0, 1, 0.5, 1);
      if (square.standing)
        typeScore = this.map(this.parameters.capability, 0, 1, 0, 0.5);

      const score = (distanceScore + nearbyScore + typeScore) / 3;
      // const score = (distanceScore + typeScore) / 2;

      this.grid.updateSquareScore(coords, score);
      return { coords, score };
    };
  }

  findTargetFrom(from: Coords, range: number) {
    // const scores = this.grid
    //   .getAccessibleNeighbors(from, range)
    //   .map(this.scoreSquare.bind(this)(from))
    //   .sort((a, b) => b.score - a.score)
    //   .map(({ score }) => score);
    // console.log('scores', scores);
    //
    // this.grid.getAccessibleNeighbors(from, range).map(square => {
    //   if (square.occupied) {
    //     console.log('ITS OCCUPIED');
    //   }
    //   if (square.wall) {
    //     console.log('ITS A WALL');
    //   }
    // });

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

  map(n: number, start1: number, stop1: number, start2: number, stop2: number) {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  }

  arrive(velocity: Vector) {
    const desired = Vector.sub(this.target, this.position);
    const distance = desired.mag();
    if (distance < SLOWING_DISTANCE) {
      const mag = this.map(distance, 0, 100, 0, this.maxSpeed);
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
    if (this.position.x < -this.radius)
      this.position.x = this.canvasWidth + this.radius;
    if (this.position.y < -this.radius)
      this.position.y = this.canvasHeight + this.radius;
    if (this.position.x > this.canvasWidth + this.radius)
      this.position.x = -this.radius;
    if (this.position.y > this.canvasHeight + this.radius)
      this.position.y = -this.radius;
  }

  render() {
    // const theta = this.velocity.heading() + radians(90);
    this.rectangle.x = this.position.x;
    this.rectangle.y = this.position.y;
    // push();
    // fill(color(this.color));
    // stroke(0);
    // translate(this.position.x, this.position.y);
    // rotate(theta);
    // beginShape(TRIANGLES);
    // vertex(0, -this.radius * 2);
    // vertex(-this.radius, this.radius * 2);
    // vertex(this.radius, this.radius * 2);
    // endShape();
    // rotate(-theta);
    // textSize(18);
    // fill(0);
    // pop();
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
