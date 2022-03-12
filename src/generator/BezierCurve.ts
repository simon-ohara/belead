import {getColor} from '../colors';
import ControlPoint from './ControlPoint';

export default class BezierCurve {
  private points: ControlPoint[] = Array(4);

  constructor(points: [number, number][]) {
    this.points = points.map(
      ([x, y], idx) => new ControlPoint(x, y, idx % 4 === 0)
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawLine(ctx);
    this.drawPoints(ctx);
  }

  drawLine(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = getColor('path');
    ctx.beginPath();
    ctx.setLineDash([8, 15]);
    ctx.moveTo(this.points[0].x, this.points[0].y);
    ctx.bezierCurveTo(
      this.points[1].x,
      this.points[1].y,
      this.points[2].x,
      this.points[2].y,
      this.points[3].x,
      this.points[3].y
    );
    ctx.stroke();
    ctx.restore();
  }

  drawPoints(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Draw handles for intermediate control points
    ctx.strokeStyle = getColor('control-arm');
    [this.points.slice(0, 2), this.points.slice(2)]
      .map(handle => handle.sort((a, b) => b.type - a.type))
      .forEach(handle => {
        const [outer, inner] = handle;
        ctx.beginPath();
        ctx.moveTo(outer.x, outer.y);
        ctx.lineTo(inner.x, inner.y);
        ctx.stroke();
      });

    // Actually render the points to the canvas
    this.points.forEach((point, idx) => {
      if (idx % 3 === 0) {
        ctx.fillStyle = getColor('end-point');
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2, false);
        ctx.fill();
      } else {
        ctx.fillStyle = getColor('control-point');
        ctx.fillRect(
          point.x - point.radius / 2,
          point.y - point.radius / 2,
          point.radius,
          point.radius
        );
      }
      // Deal with text
      ctx.font = '11px Arial';
      ctx.fillStyle = getColor('labels');
      ctx.fillText(`(${point.x},${point.y})`, point.x, point.y + 30);
    });
    ctx.restore();
  }

  getAllPoints(): ControlPoint[] {
    return [...this.points];
  }

  getPoint(index: number): ControlPoint {
    return this.points[index];
  }

  getIndex(point: ControlPoint): number {
    return this.points.indexOf(point);
  }

  pointAt(x: number, y: number): ControlPoint | undefined {
    return this.points.find(point => {
      const dx = x - point.x;
      const dy = y - point.y;
      return dx * dx + dy * dy < point.radius * point.radius;
    });
  }
}
