import { SceneManager } from '../src/scene-manager/scene-manager';
import { TestScene } from './scenes/test-scene';
import { AudioPlayer } from '../src/audio-player/audio-player';

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