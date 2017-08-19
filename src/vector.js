// @flow

export default class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(b: Vector) {
    this.x += b.x;
    this.y += b.y;
  }

  sub(b: Vector) {
    this.x -= b.x;
    this.y -= b.y;
    return this;
  }

  limit(max: number) {
    var mSq = this.magSq();
    if (mSq > max * max) {
      this.div(Math.sqrt(mSq)); //normalize it
      this.mult(max);
    }
    return this;
  }

  normalize() {
    return this.mag() === 0 ? this : this.div(this.mag());
  }

  setMag(n: number) {
    return this.normalize().mult(n);
  }

  heading() {
    var h = Math.atan2(this.y, this.x);
    return h;
  }

  mult(n: number) {
    this.x *= n || 0;
    this.y *= n || 0;
    return this;
  }

  div(n: number) {
    this.x /= n;
    this.y /= n;
    return this;
  }

  static mult(vector: Vector, multiplier: number) {
    const target = vector.copy();
    target.mult((multiplier: number));
    return target;
  }

  static div(vector: Vector, divider: number) {
    const target = vector.copy();
    target.div((divider: number));
    return target;
  }

  static dist(v1, v2) {
    return v1.dist(v2);
  }

  dist(v) {
    var d = v.copy().sub(this);
    return d.mag();
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  mag() {
    return Math.sqrt(this.magSq());
  }

  magSq() {
    const x = this.x,
      y = this.y;
    return x * x + y * y;
  }

  static add(a: Vector, b: Vector) {
    return new Vector(a.x + b.x, a.y + b.y);
  }

  static sub(a: Vector, b: Vector) {
    return new Vector(a.x - b.x, a.y - b.y);
  }
}
