import { CanvasComponent, CanvasComponentRenderOptions } from '../canvas-component/canvas-component';
import { DeltaTime } from '../delta-time/delta-time';

export interface CanvasRendererOptions {
  /**
   * Controls the renderer's frames rendered per second.
   */
  fps: number;

  /**
   * Target canvas where components are rendered.
   */
  canvas: HTMLCanvasElement;
}

export class CanvasRenderer {
  protected animationId: number;
  context: CanvasRenderingContext2D;
  component: CanvasComponent;
  componentOptions: CanvasComponentRenderOptions;
  deltaTime: DeltaTime;
  rendering = false;

  constructor(public options: CanvasRendererOptions) {
    this.context = this.options.canvas.getContext('2d', { willReadFrequently: true });
    this.deltaTime = new DeltaTime(this.options.fps);
  }

  clearCanvas() {
    const { width, height } = this.options.canvas;
    this.context.clearRect(0, 0, width, height);
  }

  render(component: CanvasComponent, options?: CanvasComponentRenderOptions) {
    this.component = component;
    this.componentOptions = options;
    this.rendering = true;
    this.animationId = requestAnimationFrame((frame: number) => this.loopAnimation(frame));
  }

  renderComponent(component: CanvasComponent, options?: CanvasComponentRenderOptions) {
    if (!component || !component.active) return;

    if (!component.paused) component.update(this.deltaTime);

    component.render(this.context, options);

    if (!component.children || !component.children.length) return;

    for(let child of this.component.children) {
      this.renderComponent(child, {
        offset: component.computedCoordinates
      });
    }
  }
    
  loopAnimation(time: number) {
    this.deltaTime.tick(time);
    // console.log(this.component.children[0].coordinates);
    if (this.deltaTime.hasFpsElapsed()) {
      this.clearCanvas();
      this.renderComponent(this.component, this.componentOptions);
    }

    this.animationId = requestAnimationFrame((frame: number) => this.loopAnimation(frame));
  }

  dispose() {
    cancelAnimationFrame(this.animationId);
    this.rendering = false;
  }
}