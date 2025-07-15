

export const TRANSITION_SCENE_NAME = 'transition';

/**
 * The SceneManager manages the scenes. It can contain one or more scenes, including the transition scene. It is also responsible for trickling down the update() calls of the component tree.
 * 
 * 
 * Usage:
 * 
 * const sceneManager = new SceneManager();
 * 
 * sceneManager.addScene('start', StartScene);
 * 
 * sceneManager.setTransitionScene(TransitionScene);
 * 
 * sceneManager.gotoScene('start'); 
 * 
 */
export class SceneManager {
  activeScene?: any;
  scenes: Record<string, any> = {};
  transitionScene?: any;

  /**
   * Adds a named scene to the manager that can be activated using gotoScene.
   * @param name unique name of scene
   * @param scene scene class
   */
  addScene(name: string, scene: any) {
    this.scenes[name] = scene;
  }

  setTransitionScene(scene: any) {
    this.addScene(TRANSITION_SCENE_NAME, scene)
  }

  gotoScene(name: string, showTransition = true) {
    this.activeScene?.dispose();
    delete this.activeScene;
    this.activeScene = new this.scenes[name]();
    if (showTransition && this.scenes[TRANSITION_SCENE_NAME]) {
      this.transitionScene = new this.scenes[TRANSITION_SCENE_NAME]();
    }
  }

  /**
   * Disposes the active and transition scenes if set.
   */
  dispose() {
    this.activeScene?.dispose();
    this.transitionScene?.dispose();
    delete this.activeScene;
    delete this.transitionScene;
  }
}