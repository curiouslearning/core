import { CanvasComponent, CanvasComponentRenderOptions } from '../../src/canvas-component/canvas-component';
import { DeltaTime, OrderedPair } from '../../src/types';
import { moveBy } from '../../src/canvas-component-helpers/move-by';

export class TestComponent extends CanvasComponent {
  direction: OrderedPair = { x: 3, y: 1 };

  update(deltaTime: DeltaTime): void {
    moveBy(this, { x: 0, y: 0 }, { x: 900, y: 500 });
  }

  render(context: CanvasRenderingContext2D, options?: CanvasComponentRenderOptions): void {
    context.fillStyle = this.options?.color || 'green';
    // console.log('test component', this.options?.color, this)
    context.fillRect(
      this.computedCoordinates.x,
      this.computedCoordinates.y,
      this.dimension.height,
      this.dimension.width
    );
  }
}