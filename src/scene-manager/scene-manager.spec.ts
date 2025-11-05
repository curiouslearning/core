import { SceneManager } from './scene-manager';

class MockScene {
  name = 'mock-scene';
  dispose() {}
}

class MockTransitionScene extends MockScene {
  override name = 'mock-transition-scene';
}

describe('SceneManager', () => {
  describe('Given Default', () => {
    const sceneManager = new SceneManager();
    describe('When addScene("test", MockScene) is called', () => {
      it('Should contain a "test" scene', () => {
        sceneManager.addScene('test', MockScene);
        expect(sceneManager.scenes['test']).toBeTruthy();
      });
    });

    describe('When setTransitionScene({}) is called', () => {
      it('Should contain a "transition" scene', () => {
        sceneManager.setTransitionScene(MockTransitionScene);
        expect(sceneManager.scenes['transition']).toBeTruthy();
      });
    });

    describe('When gotoScene("test") is called', () => {
      it('Should contain a scene with a name property called "mock-scene"', () => {
        sceneManager.addScene('test', MockScene);
        sceneManager.gotoScene('test');
        expect(sceneManager.activeScene.name).toBe('mock-scene');
      });
    });

    describe('When dispose() is called', () => {
      it('Should call mockScene.dispose()', () => {
        const spy = jest.spyOn(MockScene.prototype, 'dispose');
        sceneManager.addScene('test', MockScene);
        sceneManager.gotoScene('test');
        sceneManager.dispose();
        expect(spy).toHaveBeenCalled(); 
      });

      it('Should call mockTransitionScene.dispose()', () => {
        const spy = jest.spyOn(MockTransitionScene.prototype, 'dispose');
        sceneManager.setTransitionScene(MockTransitionScene);
        sceneManager.gotoScene('test');
        sceneManager.dispose();
        expect(spy).toHaveBeenCalled(); 
      });
    });
  });
});
