import Ball from './Ball';
import BezierCurve from './BezierCurve';
import ControlPoint from './ControlPoint';
import BezierPath from './BezierPath';
import Cursor from './Cursor';

(() => {
  const canvas: HTMLCanvasElement = document.getElementById(
    'canvas'
  )! as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  const playBtn = document.getElementById('play-btn')!;
  let playAnim = false;

  // interface MousePosition {
  //   x: number;
  //   y: number;
  // }

  // let cursor: MousePosition;

  const cursor = new Cursor();

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

  // const getFirstPoint: (
  //   curve: BezierCurve,
  //   isOuter?: boolean
  // ) => ControlPoint = (curve, isOuter = true) => {
  //   const {points: _points} = curve;
  //   return _points[isOuter ? 0 : 1];
  // };

  // const getLastPoint: (
  //   curve: BezierCurve,
  //   isOuter?: boolean
  // ) => ControlPoint = (curve, isOuter = true) => {
  //   const {points: _points} = curve;
  //   const fromLast = isOuter ? 1 : 2;
  //   return _points[_points.length - fromLast];
  // };

  const ballAtFinalPoint: () => boolean = () => {
    const {x, y} = path.getLastCurve().getPoint(3);
    return ball.isAt(x, y);
  };

  function playBtnText() {
    if (ballAtFinalPoint()) {
      playBtn.textContent = 'Restart?';
      slider.disabled = false;
    }
  }

  // enum PointType {
  //   INNER,
  //   OUTER,
  // }

  // interface Point {
  //   x: number;
  //   y: number;
  //   type: PointType;
  // }

  // class ControlPoint implements Point {
  //   x: number;
  //   y: number;
  //   type: PointType;

  //   constructor(x: number, y: number, isOuter = true) {
  //     this.x = x;
  //     this.y = y;
  //     this.type = +isOuter as PointType;
  //   }
  // }

  // class BezierCurve {
  //   points: ControlPoint[] = Array(4);

  //   constructor(points: [number, number][]) {
  //     this.points = points.map(
  //       ([x, y], idx) => new ControlPoint(x, y, idx % 4 === 0)
  //     );
  //   }
  // }

  // class Ball {
  //   x: number;
  //   y: number;
  //   speed: number;
  //   t: number;
  //   radius: number;

  //   constructor(
  //     x: number,
  //     y: number,
  //     speed: number,
  //     t: number,
  //     radius: number
  //   ) {
  //     this.x = x;
  //     this.y = y;
  //     this.speed = speed;
  //     this.t = t;
  //     this.radius = radius;
  //   }
  // }

  // let ball = {x: 30, y: 30, speed: 0.1, t: 0, radius: 20};
  //Define the bezier curve movement of the ball
  const path = new BezierPath();
  // const curves: BezierCurve[] = [];
  // curves.push(
  path.add(
    new BezierCurve([
      [30, 30],
      [70, 200],
      [125, 295],
      [350, 350],
    ])
  );

  const ball = new Ball(
    path.getCurve(0).getPoint(0).x,
    path.getCurve(0).getPoint(0).y,
    0.1,
    0,
    20
  );

  let currentBallCurve = 0;

  function moveBallInBezierCurve() {
    const curve = path.getCurve(currentBallCurve);
    const [p0, p1, p2, p3] = curve.getAllPoints();
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

    const lastPoint = curve.getPoint(3);

    if (
      ball.x === lastPoint.x &&
      ball.y === lastPoint.y &&
      currentBallCurve < path.totalCurves - 1
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
    const points = curve.getAllPoints();
    ctx.save();

    // Draw handles for intermediate control points
    ctx.strokeStyle = 'green';
    [points.slice(0, 2), points.slice(2)]
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
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2, false);
      ctx.fill();
      // Deal with text
      ctx.font = '11px Arial';
      ctx.fillText(`(${point.x},${point.y})`, point.x, point.y + 30);
    });
    ctx.restore();
  }

  function drawLine(curve: BezierCurve) {
    const points = curve.getAllPoints();
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
      if (path.dragged) {
        path.drag(path.dragged.curve, path.dragged.point, cursor);
      }

      path.getAllCurves().forEach(curve => {
        drawLine(curve);
        // Points will be above everything else
        drawPoints(curve);
      });
    }
  }

  animate();

  //Event listeners
  playBtn.addEventListener('click', () => {
    currentBallCurve = 0;
    playAnim = true;
    slider.disabled = true;
    if (ballAtFinalPoint()) {
      //Restart the animation
      const {x, y} = path.getLastCurve().getPoint(3);
      ball.t = 0;
      ball.x = x;
      ball.y = y;
      //Sort out btn text
      playBtn.textContent = 'Play';
    }
  });

  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    cursor.update(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop + window.scrollY
    );
  });

  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    cursor.update(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop + window.scrollY
    );

    if (addPoint.checked) {
      const lastPoint = path.getLastCurve().getPoint(3);
      const delta: {x: number; y: number} = {
        x: cursor.x - lastPoint.x,
        y: cursor.y - lastPoint.y,
      };

      path.add(
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
          [cursor.x, cursor.y],
        ])
      );
      addPoint.checked = false;
    }

    path.startDrag(cursor);
  });

  canvas.addEventListener('mouseup', () => {
    path.dragged = undefined;
  });

  //Change ball speed on initial document load
  parseSliderValue(Number(slider.value));
})();
