'use strict';

class Flock {
  constructor() {
    this.agents = [];
  }
  run() {
    for (const agent of this.agents) {
      agent.run(this.agents);
    }
  }
  add(agent) {
    this.agents.push(agent);
  }
}
