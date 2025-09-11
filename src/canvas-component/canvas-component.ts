
import { DeltaTime } from '../delta-time/delta-time';
import { Dimension, OrderedPair } from '../types';

export interface CanvasComponentRenderOptions {
  offset?: OrderedPair;
}

export interface CanvasComponentOptions {
  coordinates: OrderedPair;
  dimension: Dimension;
  [key: string]: any;
}

/**
 * Base building block for canvas-based components.
 */
export class CanvasComponent {
  /**
   * Default=true.
   * 
   * A component state indicating whether it should be rendered or updated. Note that children will also not be rendered or updated when its parent is set to active=false.
   * 
   */
  active: boolean = true;

  /**
   * Boolean
   * 
   * Default=true.
   * 
   * A component state indicating whether it should updated. Note that children will still be updated even when it is paused.
   * This is useful when you want to freeze a component's animation.
   */
  paused: boolean = false;

  /**
   * Default { x: 0, y: 0 }
   * 
   * This is the offset coordinate of the component. Can be treated as the parent's absolute position within the canvas.
   */
  offset: OrderedPair = { x: 0, y: 0 };

  /**
   * Default { x: 0, y: 0 }
   * 
   * This is the relative coordinate of the component.
   */
  coordinates: OrderedPair = { x: 0, y: 0 };
  children: CanvasComponent[] = [];
  deltaTime: DeltaTime;
  dimension: Dimension = { height: 0, width: 0 };

  constructor(public options?: CanvasComponentOptions) {
    this.coordinates = options?.coordinates || { x: 0, y: 0 };
    this.dimension = options?.dimension || { height: 0, width: 0 };
  }

  /**
   * Computed property of current coordinates and offset coordinates.
   */
  get computedCoordinates() {
    const { x: oX, y: oY } = this.offset;
    const { x, y } = this.coordinates;
    return {
      x: oX + x,
      y: oY + y
    };
  }

  /**
   * This is where you put the update logic of a component.
   * @param context 
   * @param renderOptions 
   */
  update(deltaTime: DeltaTime) {
    
  }

  /**
   * This is where you put the render logic of a component.
   * @param context 
   * @param renderOptions 
   */
  render(context: CanvasRenderingContext2D, options?: CanvasComponentRenderOptions) {
    
  }
}