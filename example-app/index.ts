import { SceneManager } from '../src/scene-manager/scene-manager';
import { TestScene } from './scenes/test-scene';

const sceneManager = new SceneManager();
sceneManager.addScene('test', TestScene);
sceneManager.gotoScene('test');
console.log('sceneManager', sceneManager);