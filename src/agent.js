// @flow

const SLOWING_DISTANCE = 10;
const PAUSE_TIME = 700; // miliseconds

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
  dead: boolean;
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
  rectangle: PIXI.Graphics;
  stage: PIXI.Container;
  maxSearchArea: number;
  elapsed: number;
  stoppedTime: number;

  constructor(
    id: number,
    { x, y }: Vector,
    parameters: {
      capability: number,
    },
    grid: Grid,
    stage: PIXI.Container
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
    this.maxSpeed = this.map(parameters.capability, 0, 1, 0.5, 6); // 2
    // this.maxSpeed = 2;
    this.maxForce = 0.2; // 0.2

    this.maxSearchArea = 5;
    this.elapsed = Date.now();

    this.arrived = false;

    this.createDrawing(stage);
  }

  createDrawing(stage: PIXI.container) {
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
    console.info(msg, 'background: #222; color: #bada55');
  }

  incrementTimer() {
    this.elapsed = Date.now();
    if (this.elapsed - this.stoppedTime > PAUSE_TIME) {
      this.targetFound = false;
      this.dead = false;
    }
  }

  run(agents: Array<Agent>) {
    this.incrementTimer();
    if (this.dead) return;

    this.flock(agents);
    this.moveAgent();
    this.seekTarget();
    this.borders();

    this.updateGridLocation();
    this.selectTarget();

    this.render();
  }

  seekTarget() {
    this.applyForce(this.seek(this.target));
  }

  moveAgent() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.velocity = this.arrive(this.velocity); // couldnt match square, too far away
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  updateGridLocation() {
    if (this.currentSquare)
      this.grid.updateSquare(this.currentSquare, false, this.id);
    this.currentSquare = this.grid.getSquareByPixels([
      this.position.x,
      this.position.y,
    ]);
    this.grid.updateSquare(this.currentSquare, true, this.id);
  }

  stop() {
    this.stoppedTime = Date.now();
    this.dead = true;
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
  }

  getTargetPath(targets: Array<Coords>) {
    if (!targets.length) {
      this.stop();
      this.targetPath = [];
      return [];
    }
    const path = this.findTargetPath(this.currentSquare, targets[0].coords);
    if (!path.length) {
      targets.shift();
      return this.getTargetPath(targets);
    }
    return path;
  }

  recursiveTargetSearch(currentSquare, maxSearchArea) {
    const targets = this.findTargetsFrom(currentSquare, maxSearchArea);
    if (targets.length) return targets;
    return this.recursiveTargetSearch(currentSquare, maxSearchArea + 1);
  }

  selectTarget() {
    if (this.arrived) return;

    if (!this.targetFound && !this.arrived) {
      const targets = this.recursiveTargetSearch(
        this.currentSquare,
        this.maxSearchArea
      );
      if (!targets[0]) {
        console.log('no target found stop', this.id);
        return this.stop();
      }
      if (targets[0].score <= this.highScore) {
        const destination = this.grid.getSquare(
          this.targetPath[this.targetPath.length - 1]
        );
        if (destination.occupied && destination.occupier !== this.id) {
          console.log('desintation is occupied!');
          this.highScore = 0;
          this.targetFound = false;
          return;
        }

        this.stoppedTime = Date.now();
        this.targetFound = true;
        return;
      }
      this.targetPath = this.getTargetPath(targets);
      if (this.targetPath.length) {
        // this.target = targets[0];
        this.highScore = targets[0].score;
        this.stoppedTime = Date.now();
        this.targetFound = true;
      }
      return;
    }

    // FIXME use this in case user turns off find new path every second
    if (this.targetPath.length) {
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

      this.grid.updateSquareScore(coords, score);
      return { coords, score };
    };
  }

  findTargetsFrom(from: Coords, range: number) {
    return this.grid
      .getAccessibleNeighbors(from, range)
      .map(this.scoreSquare.bind(this)(from))
      .sort((a, b) => b.score - a.score);
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
    const separation = this.separate(agents);
    separation.mult(1.5);
    this.applyForce(separation);
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
    this.rectangle.x = this.position.x;
    this.rectangle.y = this.position.y;
  }

  separate(agents: Array<Agent>) {
    const desiredSeparation = 10;
    const steer = new Vector(0, 0, 0);
    let count = 0;
    for (const other of agents) {
      const distance = Vector.dist(this.position, other.position);
      if (distance > 0 && distance < desiredSeparation) {
        const diff = Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(distance);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  align(agents: Array<Agent>) {
    const neighborDist = 50;
    const sum = new Vector(0, 0);
    let count = 0;
    for (const other of agents) {
      const distance = Vector.dist(this.position, other.position);
      if (distance > 0 && distance < neighborDist) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      const steer = Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return new Vector(0, 0);
    }
  }

  cohesion(agents: Array<Agent>) {
    const neighborDist = 50;
    const sum = new Vector(0, 0);
    let count = 0;
    for (const other of agents) {
      const distance = Vector.dist(this.position, other.position);
      if (distance > 0 && distance < neighborDist) {
        sum.add(other.position);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return new Vector(0, 0);
    }
  }
}
