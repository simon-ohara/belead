const canvas: HTMLCanvasElement = document.getElementById(
  'canvas'
)! as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const playBtn = document.getElementById('play-btn')!;
let playAnim = false;

interface MousePosition {
  x: number;
  y: number;
}

let mousePos: MousePosition;

//Slider
const slider = document.getElementById('slider')! as HTMLInputElement;
const sliderTxt = document.getElementById('slider-text')!;
//Change text content on initial document load
sliderTxt.textContent = slider.value;
slider.oninput = () => {
  sliderTxt.textContent = slider.value;
  parseSliderValue(Number(slider.value));
};

const addPoint = document.getElementById('add-point')! as HTMLInputElement;
// addPoint.onchange = () => {
//   console.log('got change', addPoint.checked);
// };
//Parse sliders value
function parseSliderValue(sliderValue: number) {
  let tPercentage = sliderValue / 10;
  //0.1 because that is the default speed of the ball
  tPercentage = tPercentage * 0.1;
  ball.speed = tPercentage;
}

const getFirstPoint: (curve: BezierCurve) => ControlPoint = curve => {
  const {points: _points} = curve;
  return _points[0];
};

const getLastPoint: (curve: BezierCurve) => ControlPoint = curve => {
  const {points: _points} = curve;
  return _points[_points.length - 1];
};

const ballAtLastPoint: (curve: BezierCurve) => boolean = curve => {
  const {x, y} = getLastPoint(curve);
  return ball.x === x && ball.y === y;
};

const ballAtFinalPoint: () => boolean = () => {
  return ballAtLastPoint(curves[curves.length - 1]);
};

function playBtnText() {
  if (ballAtFinalPoint()) {
    playBtn.textContent = 'Restart?';
    slider.disabled = false;
  }
}

enum PointType {
  INNER,
  OUTER,
}

interface Point {
  x: number;
  y: number;
  type: PointType;
}

class ControlPoint implements Point {
  x: number;
  y: number;
  type: PointType;

  constructor(x: number, y: number, isOuter = true) {
    this.x = x;
    this.y = y;
    this.type = +isOuter as PointType;
  }
}

class BezierCurve {
  points: ControlPoint[] = Array(4);

  constructor(points: [number, number][]) {
    this.points = points.map(
      ([x, y], idx) => new ControlPoint(x, y, idx % 4 === 0)
    );
  }
}

class Ball {
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

// let ball = {x: 30, y: 30, speed: 0.1, t: 0, radius: 20};
//Define the bezier curve movement of the ball
const curves: BezierCurve[] = [];
curves.push(
  new BezierCurve([
    [30, 30],
    [70, 200],
    [125, 295],
    [350, 350],
  ])
);
const ball = new Ball(curves[0].points[0].x, curves[0].points[0].y, 0.1, 0, 20);
const posRadius = 7;

interface ActivePoint {
  curve: number;
  point: ControlPoint;
}

let pointToMove: ActivePoint | null;

let isClickDown = false;

let currentBallCurve = 0;

function moveBallInBezierCurve() {
  const curve = curves[currentBallCurve];
  const [p0, p1, p2, p3] = curve.points;
  //Calculate the coefficients based on where the ball currently is in the animation
  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;

  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;

  const t = ball.t;

  //Increment t value by speed
  ball.t += ball.speed;
  //Calculate new X & Y positions of ball
  const xt = ax * (t * t * t) + bx * (t * t) + cx * t + p0.x;
  const yt = ay * (t * t * t) + by * (t * t) + cy * t + p0.y;

  if (ball.t > 1) {
    ball.t = 1;
  }

  //We draw the ball to the canvas in the new location
  ball.x = xt;
  ball.y = yt;
  drawBall();

  const lastPoint = getLastPoint(curve);

  if (
    ball.x === lastPoint.x &&
    ball.y === lastPoint.y &&
    currentBallCurve < curves.length - 1
  ) {
    currentBallCurve++;
    ball.t = ball.speed;
  }
}

function drawBall() {
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
  ctx.fill();
}

function drawPoints(curve: BezierCurve) {
  ctx.save();

  // Draw handles for intermediate control points
  ctx.strokeStyle = 'green';
  [curve.points.slice(0, 2), curve.points.slice(2)]
    .map(handle => handle.sort((a, b) => b.type - a.type))
    .forEach(handle => {
      const [outer, inner] = handle;
      ctx.beginPath();
      ctx.moveTo(outer.x, outer.y);
      ctx.lineTo(inner.x, inner.y);
      ctx.stroke();
    });

  ctx.fillStyle = 'red';
  // Actually render the points to the canvas
  curve.points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, posRadius, 0, Math.PI * 2, false);
    ctx.fill();
    // Deal with text
    ctx.font = '11px Arial';
    ctx.fillText(`(${point.x},${point.y})`, point.x, point.y + 30);
  });
  ctx.restore();
}

//Returns true if cursor is inside of point
function isMouseOverPoint(point: Point) {
  const dx = mousePos.x - point.x;
  const dy = mousePos.y - point.y;
  return dx * dx + dy * dy < posRadius * posRadius;
}

function checkIfCursorInPoint(curve?: BezierCurve) {
  if (!curve || !mousePos || !isClickDown) return null;
  return curve.points.find(point => isMouseOverPoint(point)) || null;
}

function movePoint() {
  const {points} = curves[pointToMove!.curve];
  const index = points.indexOf(pointToMove!.point as ControlPoint);
  const point = points[index];

  // constrain intermediate control points relative to outer points
  if (index % 3 === 0) {
    const innerPoint = points[index + 1] || points[index - 1];
    const deltaX = point.x - innerPoint.x;
    const deltaY = point.y - innerPoint.y;
    innerPoint.x = mousePos.x - deltaX;
    innerPoint.y = mousePos.y - deltaY;
  }

  // constrain outer points of consecutive curve
  if (pointToMove!.curve > 0 && index === 0) {
    const prevCurveLastPoint = getLastPoint(curves[pointToMove!.curve - 1]);
    prevCurveLastPoint.x = mousePos.x;
    prevCurveLastPoint.y = mousePos.y;
  }

  if (pointToMove!.curve < curves.length - 1 && index === 3) {
    const nextCurveFirstPoint = getFirstPoint(curves[pointToMove!.curve + 1]);
    nextCurveFirstPoint.x = mousePos.x;
    nextCurveFirstPoint.y = mousePos.y;
  }

  point.x = mousePos.x;
  point.y = mousePos.y;
}

function drawLine(curve: BezierCurve) {
  const {points} = curve;
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([8, 15]);
  ctx.moveTo(points[0].x, points[0].y);
  ctx.bezierCurveTo(
    points[1].x,
    points[1].y,
    points[2].x,
    points[2].y,
    points[3].x,
    points[3].y
  );
  ctx.stroke();
  ctx.restore();
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  playBtnText();

  //Ball code comes below
  if (!playAnim) {
    drawBall();
  } else {
    moveBallInBezierCurve();
  }

  if (!slider.disabled) {
    // let pointToMove: ControlPoint | null;
    // improve how we find clicked point
    // const activeCurve = curves.find(curve => {
    //   pointToMove = checkIfCursorInPoint(curve);
    //   return pointToMove;
    // })!;
    // const pointToMove = checkIfCursorInPoint(ac);
    if (pointToMove) movePoint();
    curves.forEach(curve => {
      drawLine(curve);
      //Points will be above everything else
      drawPoints(curve);
    });
  }
  // }
}

animate();

//Event listeners
playBtn.addEventListener('click', () => {
  currentBallCurve = 0;
  playAnim = true;
  slider.disabled = true;
  if (ballAtFinalPoint()) {
    //Restart the animation
    const {x, y} = getLastPoint(curves[curves.length - 1]);
    ball.t = 0;
    ball.x = x;
    ball.y = y;
    //Sort out btn text
    playBtn.textContent = 'Play';
  }
});

canvas.addEventListener('mousemove', e => {
  mousePos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop + scrollY,
  };
});

canvas.addEventListener('mousedown', () => {
  if (addPoint.checked) {
    const lastPoint = getLastPoint(curves[curves.length - 1]);
    const newPoint = mousePos;
    const delta: {x: number; y: number} = {
      x: newPoint.x - lastPoint.x,
      y: newPoint.y - lastPoint.y,
    };
    curves.push(
      new BezierCurve([
        [lastPoint.x, lastPoint.y],
        [lastPoint.x + delta.x * 0.3, lastPoint.y + delta.y * 0.3],
        [lastPoint.x + delta.x * 0.7, lastPoint.y + delta.y * 0.7],
        [newPoint.x, newPoint.y],
      ])
    );
    addPoint.checked = false;
    return;
  }

  isClickDown = true;

  // pointToMove =
  // let pointToMove: ControlPoint | null;
  // improve how we find clicked point
  let point;
  const curve = curves.findIndex(curve => {
    const pointFound = checkIfCursorInPoint(curve);

    if (pointFound) {
      point = pointFound;
      return true;
    }
    return false;
  });

  if (point && curve !== null) {
    pointToMove = {
      curve,
      point,
    };
  }
});

canvas.addEventListener('mouseup', () => {
  //Main on click down. Used for simple detection
  isClickDown = false;
  //Not moving that point any more
  pointToMove = null;
});

//Change ball speed on initial document load
parseSliderValue(Number(slider.value));
