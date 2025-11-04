import { CanvasComponent } from 'src/canvas-component/canvas-component';
import { DeltaTime } from 'src/delta-time/delta-time';

export interface CanvasComponentEffectOptions {
  componentRef?: CanvasComponent;
}

export class CanvasComponentEffect<T = CanvasComponentEffectOptions> {
  static NAME = 'CanvasComponentEffect';
  
  constructor(public options: T) {
    
  }
  
  dispose() {
    this.options = null;
  }

  update(deltaTime: DeltaTime) {
    
  }
}