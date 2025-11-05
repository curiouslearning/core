
import { CanvasComponentEffect, CanvasComponentEffectOptions } from 'src/canvas-component-effects/canvas-component-effect/canvas-component-effect';
import { DeltaTime } from '../delta-time/delta-time';
import { Dimension, OrderedPair } from '../types';

export interface CanvasComponentRenderOptions {
  offset?: OrderedPair;
}

export interface CanvasComponentOptions {
  coordinates?: OrderedPair;
  dimension?: Dimension;
  id?: string;
  [key: string]: any;
}

type NewableClassWithStatic<T, S extends Record<string, any>> = {
      new (...args: any[]): T; // Represents the constructor signature
    } & S;

/**
 * Base building block for canvas-based components.
 */
export class CanvasComponent {
  /**
   * Internal property. Do not modify.
   */
  static NEXT_ID = 0;

  /**
   * Id of component.
   * 
   * It is recommended to use a unique id for components, to make it easier to refer to them in the parent context.
   */
  id: string = '';

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

  effects: Record<string, CanvasComponentEffect> = {};

  constructor(public options?: CanvasComponentOptions) {
    this.coordinates = options?.coordinates || { x: 0, y: 0 };
    this.dimension = options?.dimension || { height: 0, width: 0 };
    this.id = options?.id || new Date().getTime() + CanvasComponent.NEXT_ID++ + this.constructor.name;
    this.initialize();
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

  addEffect<T = CanvasComponentEffectOptions>(effect: NewableClassWithStatic<any, any>, options: T) {
    const effectOptions = {
      ...options,
      componentRef: this
    };
    this.effects[effect.NAME] = new effect(effectOptions);
  }

  dispose() {
    Object.values(this.effects).forEach((effectInstance) => {
      effectInstance.dispose();
    });
    this.effects = {};
  }

  /**
   * Retrieve a component's child by the given id. Note that if several children has the same id, only the first one is returned.
   * @param id 
   * @returns 
   */
  getChildById(id: string): CanvasComponent | undefined {
    return this.children.find((child) => child.id === id);
  }

  /**
   * Init method, automatically invoked by the component life cycle.
   */
  initialize() {

  }
  /**
   * Internal update method, which invokes the public update method.
   * @param deltaTime
   */
  _update(deltaTime: DeltaTime) {
    this.deltaTime = deltaTime;
    this._updateEffects(deltaTime);
    this.update(deltaTime);
  }

  /**
   * Update method automatically invoked by the component's update life cycle. This is where you put the update logic of a component.
   * @param context 
   * @param renderOptions 
   */
  update(deltaTime: DeltaTime) {
  }

  _updateEffects(deltaTime) {
    if (!Object.values(this.effects).length) return;
    Object.values(this.effects).forEach((effect) => {
      effect.update(deltaTime);
    });
  }

  /**
   * Disposes effect and removes it from the component's list of effects
   * @param effect 
   */
  removeEffect(effect: typeof CanvasComponentEffect) {
    this.effects[effect.NAME].dispose();
    delete this.effects[effect.NAME];
  }

  /**
   * This is where you put the render logic of a component.
   * @param context 
   * @param renderOptions 
   */
  render(context: CanvasRenderingContext2D, options?: CanvasComponentRenderOptions) {
    
  }
}