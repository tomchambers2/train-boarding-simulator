'use strict';

const ARRIVAL_DISTANCE = 10;
const SLOWING_DISTANCE = 50;

class Boid {
  constructor(id, { x, y }, seats) {
    this.id = id;
    this.position = new p5.Vector(x, y);
    this.arrived = false;

    this.seat = this.findTarget(seats);
    // this.seat = seats[0];
    this.target = new p5.Vector(this.seat.location.x, this.seat.location.y);
    this.seats = seats;

    this.acceleration = new p5.Vector(0, 0);
    this.velocity = new p5.Vector(random(-1, 1), random(-1, 1));
    this.radius = 3;
    this.maxSpeed = 2;
    this.maxForce = 0.2;

    this.color = color(random(255));
  }

  findTarget(seats) {
    const targetIndex = round(random(seats.length - 1));
    const seat = seats[targetIndex];
    if (seat.occupied) {
      if (seats.some(({ occupied }) => !occupied)) {
        return this.findTarget(seats);
      }

      this.arrived = true;
      return { location: { x: width / 2, y: height / 2 } };
    }
    return seat;
  }

  checkTarget() {
    if (this.seat.occupied && !this.arrived) {
      this.seat = this.findTarget(this.seats);
      this.target = new p5.Vector(this.seat.location.x, this.seat.location.y);
    }
  }

  run(boids) {
    this.checkTarget();
    this.flock(boids);
    this.applyForce(this.seek(this.target));
    this.update();
    this.borders();
    this.render();
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  flock(boids) {
    const separation = this.separate(boids);
    separation.mult(1.5);
    this.applyForce(separation);

    // const alignment = this.align(boids);
    // alignment.mult(1);
    // this.applyForce(alignment);

    // const cohesion = this.cohesion(boids);
    // cohesion.mult(1);
    // this.applyForce(cohesion);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.velocity = this.arrive(this.velocity);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  arrive(velocity) {
    const desired = p5.Vector.sub(this.target, this.position);
    const distance = desired.mag();
    if (distance < SLOWING_DISTANCE) {
      const mag = map(distance, 0, 100, 0, this.maxSpeed);
      desired.setMag(mag);
      if (distance < ARRIVAL_DISTANCE) {
        this.arrived = true;
        this.seat.occupied = true;
      }
      return desired;
    }
    return velocity;
  }

  seek(target) {
    const desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);
    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  render() {
    const theta = this.velocity.heading() + radians(90);
    push();
    fill(this.color);
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
    // text(this.id || '', 0, 0);
    pop();
  }

  borders() {
    if (this.position.x < -this.radius) this.position.x = width + this.radius;
    if (this.position.y < -this.radius) this.position.y = height + this.radius;
    if (this.position.x > width + this.radius) this.position.x = -this.radius;
    if (this.position.y > height + this.radius) this.position.y = -this.radius;
  }

  separate(boids) {
    const desiredSeparation = 25;
    const steer = new p5.Vector(0, 0, 0);
    let count = 0;
    for (const other of boids) {
      const distance = p5.Vector.dist(this.position, other.position);
      if (distance > 0 && distance < desiredSeparation) {
        const diff = p5.Vector.sub(this.position, other.position);
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

  align(boids) {
    const neighborDist = 50;
    const sum = new p5.Vector(0, 0);
    let count = 0;
    for (const other of boids) {
      const distance = p5.Vector.dist(this.position, other.position);
      if (distance > 0 && distance < neighborDist) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      const steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    } else {
      return new p5.Vector(0, 0);
    }
  }

  cohesion(boids) {
    const neighborDist = 50;
    const sum = new p5.Vector(0, 0);
    let count = 0;
    for (const other of boids) {
      const distance = p5.Vector.dist(this.position, other.position);
      if (distance > 0 && distance < neighborDist) {
        sum.add(other.position);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return new p5.Vector(0, 0);
    }
  }
}
