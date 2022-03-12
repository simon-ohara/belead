import BezierCurve from './BezierCurve';
import ControlPoint from './ControlPoint';

interface DraggedPoint {
  curve: number;
  point: ControlPoint;
}

export default class BezierPath {
  private curves: BezierCurve[] = [];

  dragged?: DraggedPoint;

  add(curve: BezierCurve): void {
    this.curves.push(curve);
  }

  getAllCurves(): BezierCurve[] {
    return [...this.curves];
  }

  getCurve(index: number): BezierCurve {
    return this.curves[index];
  }

  getLastCurve(): BezierCurve {
    return this.curves[this.curves.length - 1];
  }

  get totalCurves(): number {
    return this.curves.length;
  }

  startDrag({x, y}: {x: number; y: number}): void {
    let point: ControlPoint | undefined;

    const curve = this.curves.findIndex(_curve => {
      point = _curve.pointAt(x, y);
      return !!point;
    });

    if (curve !== -1 && point) {
      this.dragged = {curve, point};
    }
  }

  drag(
    curveIndex: number,
    point: ControlPoint,
    cursor: Position,
    isPrimary = true
  ): void {
    const curve = this.getCurve(curveIndex);
    const index = curve.getIndex(point);

    // constrain intermediate control point relative to outer point
    if (index % 3 === 0) {
      const innerPoint = curve.getPoint(index + 1) || curve.getPoint(index - 1);
      const delta: Position = {
        x: point.x - innerPoint.x,
        y: point.y - innerPoint.y,
      };
      innerPoint.x = cursor.x - delta.x;
      innerPoint.y = cursor.y - delta.y;
    }

    if (isPrimary) {
      // constrain outer points of adjacent curve
      if (curveIndex > 0 && index === 0) {
        const prevCurveIndex = curveIndex - 1;
        const prevCurveLastPoint = this.getCurve(prevCurveIndex).getPoint(3);
        this.drag(prevCurveIndex, prevCurveLastPoint, cursor, false);
      }

      if (curveIndex > 0 && index === 1) {
        const prevCurveLastPoint = this.getCurve(curveIndex - 1).getPoint(2);
        const outerPoint = curve.getPoint(index - 1);
        const delta: Position = {
          x: outerPoint.x - point.x,
          y: outerPoint.y - point.y,
        };
        prevCurveLastPoint.x = cursor.x + delta.x * 2;
        prevCurveLastPoint.y = cursor.y + delta.y * 2;
      }

      if (curveIndex < this.totalCurves - 1 && index === 2) {
        const nextCurveFirstPoint = this.getCurve(curveIndex + 1).getPoint(1);
        const outerPoint = curve.getPoint(index + 1);
        const delta: Position = {
          x: outerPoint.x - point.x,
          y: outerPoint.y - point.y,
        };
        nextCurveFirstPoint.x = cursor.x + delta.x * 2;
        nextCurveFirstPoint.y = cursor.y + delta.y * 2;
      }

      // constrain outer points of adjacent curve
      if (curveIndex < this.totalCurves - 1 && index === 3) {
        const nextCurveIndex = curveIndex + 1;
        const nextCurveFirstPoint = this.getCurve(nextCurveIndex).getPoint(0);
        this.drag(nextCurveIndex, nextCurveFirstPoint, cursor, false);
      }
    }

    point.x = cursor.x;
    point.y = cursor.y;
  }
}
