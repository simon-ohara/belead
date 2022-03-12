import Ball from './Ball';
import BezierCurve from './BezierCurve';
import BezierPath from './BezierPath';
import Cursor from './Cursor';

export default class Generator {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  cursor: Cursor;

  path: BezierPath;
  ball: Ball;

  currentBallCurve = 0;
  play = false;
  disabled = false;
  adding = false;

  events: Record<string, (...args: unknown[]) => unknown>[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    this.cursor = new Cursor();
    this.path = new BezierPath();
    this.ball = new Ball(-100, -100, Ball.speed, 20);
  }

  addEventListener(
    name: string,
    handler: (...args: unknown[]) => unknown
  ): void {
    this.events.push({
      [name]: handler,
    });
  }

  dispatchEvent(name: string) {
    this.events.filter(event => event[name]).forEach(event => event[name]());
  }

  ballAtFinalPoint(): boolean {
    const {x, y} = this.path.getLastCurve().getPoint(3);
    return this.ball.isAt(x, y);
  }

  resetBall(): void {
    const {x, y} = this.path.getCurve(0).getPoint(0);
    this.ball.t = 0;
    this.ball.x = x;
    this.ball.y = y;
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // playBtnText();

    //Ball code comes below
    if (!this.play) {
      this.ball.draw(this.context);
    } else {
      this.followPath();
    }

    if (this.path.dragged) {
      this.path.drag(
        this.path.dragged.curve,
        this.path.dragged.point,
        this.cursor
      );
    }

    this.path.getAllCurves().forEach(curve => curve.draw(this.context));
  }

  getNextPosition([p0, p1, p2, p3]: SimpleCurve, t: number): Position {
    // X coefficients based on current points
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    // Y coefficients based on current points
    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    // Calculate new X & Y positions of ball using tValue
    const xt = ax * (t * t * t) + bx * (t * t) + cx * t + p0.x;
    const yt = ay * (t * t * t) + by * (t * t) + cy * t + p0.y;

    return {x: xt, y: yt};
  }

  followPath(): void {
    const curve = this.path.getCurve(this.currentBallCurve);

    // We draw the ball to the canvas in the new location
    this.ball.update(
      this.getNextPosition(
        curve
          .getAllPoints()
          .map(point => ({x: point.x, y: point.y})) as SimpleCurve,
        this.ball.t
      ),
      this.context
    );

    // Transition to next curve
    const lastPoint = curve.getPoint(3);
    if (this.ball.isAt(lastPoint.x, lastPoint.y)) {
      if (this.currentBallCurve < this.path.totalCurves - 1) {
        // if this is not the last curve move to next
        this.currentBallCurve++;
        // Reset tValue
        this.ball.t = this.ball.speed;
        return;
      }
      // if this is last curve stop
      this.play = false;
      this.dispatchEvent('complete');
    }
  }

  start(): void {
    const start = 30;
    this.path.add(
      new BezierCurve([
        [start, start],
        [70, 200],
        [125, 295],
        [350, 350],
      ])
    );

    this.ball.x = start;
    this.ball.y = start;
    this.loop();
  }

  onMouseDown(event: MouseEvent): void {
    this.cursor.update(
      event.clientX - this.canvas.offsetLeft,
      event.clientY - this.canvas.offsetTop + window.scrollY
    );

    if (this.adding) {
      const lastPoint = this.path.getLastCurve().getPoint(3);
      const delta: Position = {
        x: this.cursor.x - lastPoint.x,
        y: this.cursor.y - lastPoint.y,
      };

      this.path.add(
        new BezierCurve([
          [lastPoint.x, lastPoint.y],
          [
            Math.floor(lastPoint.x + delta.x * 0.3),
            Math.floor(lastPoint.y + delta.y * 0.3),
          ],
          [
            Math.floor(lastPoint.x + delta.x * 0.7),
            Math.floor(lastPoint.y + delta.y * 0.7),
          ],
          [this.cursor.x, this.cursor.y],
        ])
      );
    }

    this.path.startDrag(this.cursor);
  }

  onMouseMove(event: MouseEvent): void {
    this.cursor.update(
      event.clientX - this.canvas.offsetLeft,
      event.clientY - this.canvas.offsetTop + window.scrollY
    );
  }

  onMouseUp(): void {
    this.path.dragged = undefined;
  }

  export(): SimpleCurve[] {
    return this.path
      .getAllCurves()
      .map(
        curve =>
          curve
            .getAllPoints()
            .map(point => ({x: point.x, y: point.y})) as SimpleCurve
      );
  }
}
