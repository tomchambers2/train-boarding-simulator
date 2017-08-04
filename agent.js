'use strict';

const SLOWING_DISTANCE = 10;

class Agent {
  constructor(id, { x, y }, parameters) {
    this.parameters = parameters;
    this.id = id;
    this.position = new p5.Vector(x, y);
    this.target = new p5.Vector(0, 0);
    this.targetPath = [];

    this.acceleration = new p5.Vector(0, 0);
    this.velocity = new p5.Vector(random(-1, 1), random(-1, 1));
    this.radius = 3;
    this.maxSpeed = random(5, 20); // 2
    this.maxForce = 0.2; // 0.2

    this.arrived = false;

    this.color = color(random(200, 255));

    this.capability = Math.random();
    this.tiredness = Math.random();
    this.journeyLength = Math.random();
  }

  getCurrentSquare() {
    if (this.currentSquare) grid.setSquareState(this.currentSquare, false);
    this.currentSquare = grid.getCurrentLocation(this.position);
    grid.setSquareState(this.currentSquare, true, this.id);
  }

  move() {
    if (!this.targetPath.length && !this.arrived) {
      return this.findTarget();
    } else if (!this.targetPath.length) {
      return;
    }
    if (
      this.targetPath.length &&
      grid.getSquareInfo(this.targetPath[this.targetPath.length - 1])
        .occupied &&
      grid.getSquareInfo(this.targetPath[this.targetPath.length - 1])
        .occupiedBy !== this.id
    ) {
      console.log('BLOCKED FIND NEW');
      return this.findTarget();
    }
    if (
      this.targetPath[0][0] === this.currentSquare[0] &&
      this.targetPath[0][1] === this.currentSquare[1]
    ) {
      // recalc path on each frame
      // console.log(this.id, 'go to', grid.getSquareLocation(this.target));
      // this.targetPath = grid.findPath(this.currentSquare, this.target);
      // return;
      this.targetPath.shift();
      if (!this.targetPath.length) {
        this.arrived = true;
        console.log('journey over');
      }
      return;
    }
    this.target = grid.getSquareLocation(this.targetPath[0]);
  }

  rand(max) {
    return Math.floor(Math.random() * max);
  }

  scoreSquare(square) {
    // let score = square.distance / this.parameters.disability;
    // score += square.isSeat * this.parameters.tiredness;
    let score = 0;
    if (square.seat) score += 2;
    if (square.standingSpace) score += 1;
    if (grid.getSquareInfo(this.currentSquare).seat) {
      if (
        this.currentSquare[0] === square.coords[0] &&
        this.currentSquare[1] === square.coords[1]
      ) {
      }
    }
    if (grid.getSquareInfo(this.currentSquare).seat) score = 0; // if in a seat, higher threshold
    square.score = score;
    return square;
  }

  findTarget() {
    const scoredSquares = grid
      .getVisibleSquares(this.currentSquare, 20)
      .map(this.scoreSquare.bind(this))
      .sort((a, b) => b.score - a.score);
    this.targetPath = grid.findPath(
      this.currentSquare,
      scoredSquares[0].coords
    );
    // this.targetPath = [[this.rand(10), this.rand(10)]];
  }

  update() {
    this.getCurrentSquare();
    this.move();

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.velocity = this.arrive(this.velocity); // couldnt match square, too far away
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  run(agents) {
    // this.flock(agents);
    this.applyForce(this.seek(this.target));
    this.update();
    this.borders();
    this.render();
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  seek(target) {
    const desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);
    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  arrive(velocity) {
    const desired = p5.Vector.sub(this.target, this.position);
    const distance = desired.mag();
    if (distance < SLOWING_DISTANCE) {
      const mag = map(distance, 0, 100, 0, this.maxSpeed);
      desired.setMag(mag);
      return desired;
    }
    return velocity;
  }

  flock(agents) {
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
    if (this.position.x < -this.radius) this.position.x = width + this.radius;
    if (this.position.y < -this.radius) this.position.y = height + this.radius;
    if (this.position.x > width + this.radius) this.position.x = -this.radius;
    if (this.position.y > height + this.radius) this.position.y = -this.radius;
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
