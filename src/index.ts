import Generator from './Generator';

(() => {
  const canvas: HTMLCanvasElement = document.getElementById(
    'canvas'
  ) as HTMLCanvasElement;

  const generator = new Generator(canvas);
  generator.addEventListener('complete', () => {
    playBtn.textContent = 'Play';
  });

  const playBtn = document.getElementById('play-btn')!;
  playBtn.addEventListener('click', () => {
    if (generator.play) {
      generator.play = false;
      playBtn.textContent = 'Play';
      return;
    }
    generator.currentBallCurve = 0;
    generator.play = true;
    // slider.disabled = true;
    playBtn.textContent = 'Pause';
    if (generator.ballAtFinalPoint()) {
      generator.resetBall();
    }
  });

  const resetBtn = document.getElementById('reset-btn')!;
  resetBtn.addEventListener('click', () => {
    generator.resetBall();
  });

  //Slider
  const slider = document.getElementById('slider')! as HTMLInputElement;
  const sliderTxt = document.getElementById('slider-text')!;
  slider.addEventListener('input', () => {
    sliderTxt.textContent = slider.value;
    generator.ball.adjustSpeed(+slider.value / 10);
  });
  slider.dispatchEvent(new Event('input'));

  const addPoint = document.getElementById('add-point')! as HTMLInputElement;
  addPoint.addEventListener('change', () => {
    generator.adding = addPoint.checked;
  });

  canvas.addEventListener('mousemove', generator.onMouseMove.bind(generator));
  canvas.addEventListener('mousedown', generator.onMouseDown.bind(generator));
  canvas.addEventListener('mouseup', () => {
    generator.onMouseUp.call(generator);
    addPoint.checked = false;
  });

  generator.start();
})();
