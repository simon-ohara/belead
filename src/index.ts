import Generator from './generator';
import UserInput, {UserInputMap} from './UserInput';

(() => {
  const canvas: HTMLCanvasElement = document.getElementById(
    'canvas'
  ) as HTMLCanvasElement;

  const generator = new Generator(canvas);
  generator.addEventListener('complete', () => {
    playBtn.classList.add('paused');
  });

  canvas.addEventListener('mousemove', generator.onMouseMove.bind(generator));
  canvas.addEventListener('mousedown', generator.onMouseDown.bind(generator));
  canvas.addEventListener('mouseup', () => {
    generator.onMouseUp.call(generator);
  });

  const input = new UserInput();
  input.addEventListener('keydown', (inputs: UserInputMap[]) => {
    if (inputs.includes(UserInputMap.ADD)) {
      addPoint.checked = true;
      addPoint.dispatchEvent(new Event('change'));
    }
  });
  input.addEventListener('keyup', (inputs: UserInputMap[]) => {
    if (!inputs.includes(UserInputMap.ADD)) {
      addPoint.checked = false;
      addPoint.dispatchEvent(new Event('change'));
    }
  });

  const playBtn = document.getElementById('play-button')!;
  playBtn.addEventListener('click', () => {
    if (generator.play) {
      generator.play = false;
      playBtn.classList.add('paused');
      return;
    }
    generator.currentBallCurve = 0;
    generator.play = true;
    playBtn.classList.remove('paused');
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

  const exportButton = document.getElementById('export-button')!;
  exportButton.addEventListener('click', () => {
    console.log('EXPORT!', generator.export());
  });

  generator.start();
})();
