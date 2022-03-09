declare const canvas: HTMLCanvasElement;
declare const ctx: CanvasRenderingContext2D;
declare const playBtn: HTMLElement;
declare let playAnim: boolean;
interface MousePosition {
    x: number;
    y: number;
}
declare let mousePos: MousePosition;
declare const slider: HTMLInputElement;
declare const sliderTxt: HTMLElement;
declare const addPoint: HTMLInputElement;
declare function parseSliderValue(sliderValue: number): void;
declare const getLastPoint: () => ControlPoint;
declare const ballAtLastPoint: () => boolean;
declare function playBtnText(): void;
declare enum PointType {
    INNER = 0,
    OUTER = 1
}
interface Point {
    x: number;
    y: number;
    type: PointType;
}
declare class ControlPoint implements Point {
    x: number;
    y: number;
    type: PointType;
    constructor(x: number, y: number, isOuter?: boolean);
}
declare class BezierCurve {
    points: ControlPoint[];
    constructor(points: [number, number][]);
}
declare class Ball {
    x: number;
    y: number;
    speed: number;
    t: number;
    radius: number;
    constructor(x: number, y: number, speed: number, t: number, radius: number);
}
declare const curves: BezierCurve[];
declare const ball: Ball;
declare const posRadius = 7;
declare let isClickDown: boolean;
declare function moveBallInBezierCurve(curve: BezierCurve): void;
declare function drawBall(): void;
declare function drawPoints(curve: BezierCurve): void;
declare function isMouseOverPoint(point: Point): boolean;
declare function checkIfCursorInPoint(curve?: BezierCurve): ControlPoint | null;
declare function movePoint(curve: BezierCurve, pointToMove: ControlPoint): void;
declare function drawLine(curve: BezierCurve): void;
declare function animate(): void;
