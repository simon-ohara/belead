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
declare const getFirstPoint: (curve: BezierCurve) => ControlPoint;
declare const getLastPoint: (curve: BezierCurve) => ControlPoint;
declare const ballAtLastPoint: (curve: BezierCurve) => boolean;
declare const ballAtFinalPoint: () => boolean;
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
interface ActivePoint {
    curve: number;
    point: ControlPoint;
}
declare let pointToMove: ActivePoint | null;
declare let isClickDown: boolean;
declare let currentBallCurve: number;
declare function moveBallInBezierCurve(): void;
declare function drawBall(): void;
declare function drawPoints(curve: BezierCurve): void;
declare function isMouseOverPoint(point: Point): boolean;
declare function checkIfCursorInPoint(curve?: BezierCurve): ControlPoint | null;
declare function movePoint(): void;
declare function drawLine(curve: BezierCurve): void;
declare function animate(): void;
