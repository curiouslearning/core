import { SceneManager } from '../src/scene-manager/scene-manager';
import { TestScene } from './scenes/test-scene';
import { AudioPlayer } from '../src/audio-player/audio-player';
import { TestComponent } from './components/test-component';
import { CanvasRenderer } from '../src/canvas-renderer/canvas-renderer';
import { CanvasComponent } from '../src/canvas-component/canvas-component';

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


const random = (min, max): number => Math.random() * (max - min) + min;
const randomSign = () => Math.random() < 0.5 ? -1 : 1;
const genRandomDirection = () => ({ x: (random(5, 10) * randomSign()), y: (random(2, 4) * randomSign()) })
// test component
let components: TestComponent[] = [];
let components2: TestComponent[] = [];
for(let x = 0; x < 1; x++) {
  const testComponent = new TestComponent({
    coordinates: { x: 200, y: 200 },
    dimension: { height: 50, width: 50 }
  });
  testComponent.direction = genRandomDirection();
  components.push(testComponent);

    const testComponent2 = new TestComponent({
    coordinates: { x: 200, y: 200 },
    dimension: { height: 50, width: 50 },
  });
  testComponent2.direction = JSON.parse(JSON.stringify(testComponent.direction));
  components2.push(testComponent2);
}

const mycomponent = new CanvasComponent();
mycomponent.children = components;

const mycomponent2 = new CanvasComponent();
mycomponent2.children = components2;

const canvas = document.querySelector('#root-canvas') as HTMLCanvasElement;
const canvasRenderer = new CanvasRenderer({ canvas, fps: 10 });

const canvas2 = document.querySelector('#root-canvas2') as HTMLCanvasElement;
const canvasRenderer2 = new CanvasRenderer({ canvas: canvas2, fps: 30 });

document.querySelector('#render')?.addEventListener('click', () => {
  if (canvasRenderer.rendering) {
    canvasRenderer.dispose();
  } else {
    canvasRenderer.render(mycomponent);
  }

  if (canvasRenderer2.rendering) {
    canvasRenderer2.dispose();
  } else {
    canvasRenderer2.render(mycomponent2);
  }
});