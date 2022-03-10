import ControlPoint from './ControlPoint';

export default class BezierCurve {
  private points: ControlPoint[] = Array(4);

  constructor(points: [number, number][]) {
    this.points = points.map(
      ([x, y], idx) => new ControlPoint(x, y, idx % 4 === 0)
    );
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
