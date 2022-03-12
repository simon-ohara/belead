import {getColor} from '../colors';

export default class Ball {
  static speed = 0.1;

  x: number;
  y: number;
  speed: number;
  t = 0;
  radius: number;

  constructor(x: number, y: number, speed: number, radius: number) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.radius = radius;
  }

  adjustSpeed(tPercentage: number): void {
    this.speed = tPercentage * Ball.speed;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = getColor('ball');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  }

  isAt(x: number, y: number): boolean {
    return this.x === x && this.y === y;
  }

  update(position: Position, ctx: CanvasRenderingContext2D): void {
    this.x = position.x;
    this.y = position.y;
    this.t += this.speed;
    if (this.t > 1) {
      this.t = 1;
    }
    this.draw(ctx);
  }
}
