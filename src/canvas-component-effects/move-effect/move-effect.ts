import { OrderedPair } from 'src/types';
import { CanvasComponentEffect, CanvasComponentEffectOptions } from '../canvas-component-effect/canvas-component-effect';
import { DeltaTime } from 'src/delta-time/delta-time';

export interface MoveEffectOptions extends CanvasComponentEffectOptions {
  speed: OrderedPair;
  minBounds?: OrderedPair;
  maxBounds?: OrderedPair;
  boundsOffset?: number;
}

/**
 * An effect used to move a component across the x and y axis at a given rate.
 * It comes with a bounds config to indicate whether it should bounce off the edges of a container.
 */
export class MoveEffect extends CanvasComponentEffect<MoveEffectOptions> {
  static override NAME = 'MoveEffect';

  constructor(options: MoveEffectOptions) {
    super(options);
  }

  override update(deltaTime: DeltaTime) {
    const component = this.options.componentRef;
    const { x, y } = component.coordinates;
    const offset = this.options.boundsOffset || 0;
    const { minBounds, maxBounds } = this.options;
    let { x: directionX, y: directionY } = this.options.speed;
    let { width, height } = component.dimension;
    
    if (
      // if moving left, check left bounds
      (directionX < 0 && minBounds && minBounds.x >= (x - offset))

      // or if moving right, check left bounds
      || (directionX > 0 && maxBounds && maxBounds.x < (x + width + offset))
    ) directionX *= -1;

    // if moving up, check upper bounds
    if (
      (directionY < 0 && minBounds && minBounds.y >= y - offset)

      // if moving down, check lower bounds
      || (directionY > 0 && maxBounds && maxBounds.y < (y + height + offset))
    ) directionY *= -1;

    this.options.componentRef.coordinates.x += directionX * deltaTime.dt;
    this.options.componentRef.coordinates.y += directionY * deltaTime.dt;
    this.options.speed = { x: directionX, y: directionY };
    
  }
}