"use strict";
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var playBtn = document.getElementById('play-btn');
var playAnim = false;
var mousePos;
//Slider
var slider = document.getElementById('slider');
var sliderTxt = document.getElementById('slider-text');
//Change text content on initial document load
sliderTxt.textContent = slider.value;
slider.oninput = function () {
    sliderTxt.textContent = slider.value;
    parseSliderValue(Number(slider.value));
};
var addPoint = document.getElementById('add-point');
// addPoint.onchange = () => {
//   console.log('got change', addPoint.checked);
// };
//Parse sliders value
function parseSliderValue(sliderValue) {
    var tPercentage = sliderValue / 10;
    //0.1 because that is the default speed of the ball
    tPercentage = tPercentage * 0.1;
    ball.speed = tPercentage;
}
var getLastPoint = function () {
    var _points = curves[curves.length - 1].points;
    return _points[_points.length - 1];
};
var ballAtLastPoint = function () {
    var _a = getLastPoint(), x = _a.x, y = _a.y;
    return ball.x === x && ball.y === y;
};
function playBtnText() {
    if (ballAtLastPoint()) {
        playBtn.textContent = 'Restart?';
        slider.disabled = false;
    }
}
var PointType;
(function (PointType) {
    PointType[PointType["INNER"] = 0] = "INNER";
    PointType[PointType["OUTER"] = 1] = "OUTER";
})(PointType || (PointType = {}));
var ControlPoint = /** @class */ (function () {
    function ControlPoint(x, y, isOuter) {
        if (isOuter === void 0) { isOuter = true; }
        this.x = x;
        this.y = y;
        this.type = +isOuter;
    }
    return ControlPoint;
}());
var BezierCurve = /** @class */ (function () {
    function BezierCurve(points) {
        this.points = Array(4);
        this.points = points.map(function (_a, idx) {
            var x = _a[0], y = _a[1];
            return new ControlPoint(x, y, idx % 4 === 0);
        });
    }
    return BezierCurve;
}());
var Ball = /** @class */ (function () {
    function Ball(x, y, speed, t, radius) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.t = t;
        this.radius = radius;
    }
    return Ball;
}());
// let ball = {x: 30, y: 30, speed: 0.1, t: 0, radius: 20};
//Define the bezier curve movement of the ball
var curves = [];
curves.push(new BezierCurve([
    [30, 30],
    [70, 200],
    [125, 295],
    [350, 350],
]));
var ball = new Ball(curves[0].points[0].x, curves[0].points[0].y, 0.1, 0, 20);
var posRadius = 7;
// let pointToMove: ControlPoint | null;
var isClickDown = false;
function moveBallInBezierCurve(curve) {
    var _a = curve.points, p0 = _a[0], p1 = _a[1], p2 = _a[2], p3 = _a[3];
    //Calculate the coefficients based on where the ball currently is in the animation
    var cx = 3 * (p1.x - p0.x);
    var bx = 3 * (p2.x - p1.x) - cx;
    var ax = p3.x - p0.x - cx - bx;
    var cy = 3 * (p1.y - p0.y);
    var by = 3 * (p2.y - p1.y) - cy;
    var ay = p3.y - p0.y - cy - by;
    var t = ball.t;
    //Increment t value by speed
    ball.t += ball.speed;
    //Calculate new X & Y positions of ball
    var xt = ax * (t * t * t) + bx * (t * t) + cx * t + p0.x;
    var yt = ay * (t * t * t) + by * (t * t) + cy * t + p0.y;
    if (ball.t > 1) {
        ball.t = 1;
    }
    //We draw the ball to the canvas in the new location
    ball.x = xt;
    ball.y = yt;
    drawBall();
}
function drawBall() {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fill();
}
function drawPoints(curve) {
    ctx.save();
    // Draw handles for intermediate control points
    ctx.strokeStyle = 'green';
    [curve.points.slice(0, 2), curve.points.slice(2)]
        .map(function (handle) { return handle.sort(function (a, b) { return b.type - a.type; }); })
        .forEach(function (handle) {
        var outer = handle[0], inner = handle[1];
        ctx.beginPath();
        ctx.moveTo(outer.x, outer.y);
        ctx.lineTo(inner.x, inner.y);
        ctx.stroke();
    });
    ctx.fillStyle = 'red';
    // Actually render the points to the canvas
    curve.points.forEach(function (point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, posRadius, 0, Math.PI * 2, false);
        ctx.fill();
        // Deal with text
        ctx.font = '11px Arial';
        ctx.fillText("(".concat(point.x, ",").concat(point.y, ")"), point.x, point.y + 30);
    });
    ctx.restore();
}
//Returns true if cursor is inside of point
function isMouseOverPoint(point) {
    var dx = mousePos.x - point.x;
    var dy = mousePos.y - point.y;
    return dx * dx + dy * dy < posRadius * posRadius;
}
function checkIfCursorInPoint(curve) {
    if (!curve || !mousePos || !isClickDown)
        return null;
    return curve.points.find(function (point) { return isMouseOverPoint(point); }) || null;
}
function movePoint(curve, pointToMove) {
    var points = curve.points;
    var index = points.indexOf(pointToMove);
    var point = points[index];
    // constrain intermediate control points relative to outer points
    if (index % 3 === 0) {
        var innerPoint = points[index + 1] || points[index - 1];
        var deltaX = point.x - innerPoint.x;
        var deltaY = point.y - innerPoint.y;
        innerPoint.x = mousePos.x - deltaX;
        innerPoint.y = mousePos.y - deltaY;
    }
    point.x = mousePos.x;
    point.y = mousePos.y;
}
function drawLine(curve) {
    var points = curve.points;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([8, 15]);
    ctx.moveTo(points[0].x, points[0].y);
    ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
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
    }
    else {
        curves.forEach(function (curve) { return moveBallInBezierCurve(curve); });
    }
    if (!slider.disabled) {
        var pointToMove_1;
        // improve how we find clicked point
        var activeCurve = curves.find(function (curve) {
            pointToMove_1 = checkIfCursorInPoint(curve);
            return pointToMove_1;
        });
        // const pointToMove = checkIfCursorInPoint(ac);
        if (pointToMove_1)
            movePoint(activeCurve, pointToMove_1);
        curves.forEach(function (curve) {
            drawLine(curve);
            //Points will be above everything else
            drawPoints(curve);
        });
    }
    // }
}
animate();
//Event listeners
playBtn.addEventListener('click', function () {
    playAnim = true;
    slider.disabled = true;
    if (ballAtLastPoint()) {
        //Restart the animation
        var _a = getLastPoint(), x = _a.x, y = _a.y;
        ball.t = 0;
        ball.x = x;
        ball.y = y;
        //Sort out btn text
        playBtn.textContent = 'Play';
    }
});
canvas.addEventListener('mousemove', function (e) {
    mousePos = {
        x: e.clientX - canvas.offsetLeft,
        y: e.clientY - canvas.offsetTop + scrollY,
    };
});
canvas.addEventListener('mousedown', function () {
    if (addPoint.checked) {
        var lastPoint = getLastPoint();
        var newPoint = mousePos;
        var delta = {
            x: newPoint.x - lastPoint.x,
            y: newPoint.y - lastPoint.y,
        };
        curves.push(new BezierCurve([
            [lastPoint.x, lastPoint.y],
            [lastPoint.x + delta.x * 0.3, lastPoint.y + delta.y * 0.3],
            [lastPoint.x + delta.x * 0.7, lastPoint.y + delta.y * 0.7],
            [newPoint.x, newPoint.y],
        ]));
        addPoint.checked = false;
        return;
    }
    isClickDown = true;
});
canvas.addEventListener('mouseup', function () {
    //Main on click down. Used for simple detection
    isClickDown = false;
    //Not moving that point any more
    // pointToMove = null;
});
//Change ball speed on initial document load
parseSliderValue(Number(slider.value));
//# sourceMappingURL=index.js.map