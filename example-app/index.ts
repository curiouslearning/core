import { SceneManager } from '../src/scene-manager/scene-manager';
import { TestScene } from './scenes/test-scene';
import { AudioPlayer } from '../src/audio-player/audio-player';
import { TestComponent } from './components/test-component';

const sceneManager = new SceneManager();
sceneManager.addScene('test', TestScene);
sceneManager.gotoScene('test');
console.log('sceneManager', sceneManager);
const player = new AudioPlayer({ maxBufferSize: 10 });
const SAMPLE1 = 'https://globallit-aws-s3-static-webapp-test-us-east-2.s3.us-west-2.amazonaws.com/feed-the-monster/assets/audios/Cheering-01.mp3';
const SAMPLE2 = 'https://globallit-aws-s3-static-webapp-test-us-east-2.s3.us-west-2.amazonaws.com/feed-the-monster/assets/audios/Cheering-02.mp3';
const SAMPLE3 = 'https://globallit-aws-s3-static-webapp-test-us-east-2.s3.us-west-2.amazonaws.com/feed-the-monster/assets/audios/Cheering-03.mp3';


/**
 * To make use of storybook for even better devX.
 */
document.querySelector('#play')?.addEventListener('click', () => {
  player.play(SAMPLE1);
  player.play(SAMPLE2);
  player.play(SAMPLE3);
});

document.querySelector('#playThrottled')?.addEventListener('click', () => {
  player.play(SAMPLE1, {
    throttle: 1000
  });
  player.play(SAMPLE2, {
    throttle: 1500,
    throttleCheck: () => false
  });

  player.play(SAMPLE2, {
    throttle: 2000,
    throttleCheck: () => true
  });
});
document.querySelector('#playQueue')?.addEventListener('click', () => player.playQueue([
  SAMPLE1,
  SAMPLE2,
  SAMPLE3
]));


const random = (min, max) => Math.random() * (max - min) + min;

// test component
let id;
const startAnimationLoop = () => {
  let components: TestComponent[] = [];
  for(let x = 0; x < 100; x++) {
    const testComponent = new TestComponent({
      coordinates: { x: 200, y: 200 },
      dimension: { height: 50, width: 50 },
    });
    testComponent.direction = { x: random(-5, 5), y: random(-5, 5) };
    components.push(testComponent);
  }

  const canvas = document.querySelector('#root-canvas') as HTMLCanvasElement;
  const canvas2 = document.querySelector('#root-canvas2') as HTMLCanvasElement;
  const canvas3 = document.querySelector('#root-canvas3') as HTMLCanvasElement;
  const context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
  const context2 = canvas2.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
  const context3 = canvas3.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
  const rect = canvas.getBoundingClientRect();
  const canvasHeight = rect.height;
  const canvasWidth = rect.width;
  console.log(rect);
  const animate = (current: number = 0) => {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    components.forEach((component) => {
      component._runRenderLifeCycle(
        context, {
          deltaTime: { current },
          offset: { x: 0, y: 0 }
        }
      );
    });
    
    context2.clearRect(0, 0, canvasWidth, canvasHeight);
    components.forEach((component) => {
      component._runRenderLifeCycle(
        context2, {
          deltaTime: { current },
          offset: { x: 0, y: 0 }
        }
      );
    });

    context3.clearRect(0, 0, canvasWidth, canvasHeight);
    components.forEach((component) => {
      component._runRenderLifeCycle(
        context3, {
          deltaTime: { current },
          offset: { x: 0, y: 0 }
        }
      );
    });
    id = requestAnimationFrame(animate);
  };

  animate();
}

document.querySelector('#render')?.addEventListener('click', () => {
  if (id) {
    cancelAnimationFrame(id);
    id = null;
  } else {
    startAnimationLoop();
  }
});