export default class Flock {
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
  wait() {
    for (const agent of this.agents) {
      agent.changeState('wait');
    }
  }
  board() {
    for (const agent of this.agents) {
      agent.changeState('board');
    }
  }
  killBoarded() {
    for (var i = 0; i < this.agents.length; i++) {
      this.agents.splice(this.agents[i], 1);
    }
  }
  shiftBoarded(distance, time) {
    for (const agent of this.agents) {
      if (agent.boarded) {
        agent.shift(distance, time);
      }
    }
  }
}
