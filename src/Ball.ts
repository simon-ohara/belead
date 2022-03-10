export default class Ball {
  x: number;
  y: number;
  speed: number;
  t: number;
  radius: number;

  constructor(x: number, y: number, speed: number, t: number, radius: number) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.t = t;
    this.radius = radius;
  }
}
