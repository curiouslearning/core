import { CanvasComponent } from 'src/canvas-component/canvas-component';
import { DeltaTime } from 'src/delta-time/delta-time';

export interface CanvasComponentEffectOptions {
  componentRef?: CanvasComponent;
}

/**
 * Base component for creating effects. Effects are reusable classes that perform mutations to a component's properties.
 * 
 * A given component may have many effects.
 * 
 * Render logic should still be handled at the component render function.
 */
export class CanvasComponentEffect<T = CanvasComponentEffectOptions> {
  static NAME = 'CanvasComponentEffect';
  
  constructor(public options: T) {
    
  }
  
  dispose() {
    this.options = null;
  }

  /**
   * Automatically triggered by the render cycle.
   * @param deltaTime {DeltaTime}
   */
  update(deltaTime: DeltaTime) {
    
  }
}