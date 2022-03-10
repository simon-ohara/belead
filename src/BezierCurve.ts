import ControlPoint from './ControlPoint';

export default class BezierCurve {
  points: ControlPoint[] = Array(4);

  constructor(points: [number, number][]) {
    this.points = points.map(
      ([x, y], idx) => new ControlPoint(x, y, idx % 4 === 0)
    );
  }
}
