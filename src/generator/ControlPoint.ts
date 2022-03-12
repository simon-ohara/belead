export enum PointType {
  INNER,
  OUTER,
}

export interface Point extends Position {
  radius: number;
  type: PointType;
}

export default class ControlPoint implements Point {
  x: number;
  y: number;
  radius = 7;
  type: PointType;

  constructor(x: number, y: number, isOuter = true) {
    this.x = x;
    this.y = y;
    this.type = +isOuter as PointType;
  }
}
