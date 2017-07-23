'use strict';

class Flock {
  constructor() {
    this.boids = [];
  }
  run() {
    for (const boid of this.boids) {
      boid.run(this.boids);
    }
  }
  add(boid) {
    this.boids.push(boid);
  }
}
