import { CanvasComponent, CanvasComponentRenderOptions } from '../../src/canvas-component/canvas-component';
import { OrderedPair } from '../../src/types';
import { moveBy } from '../../src/canvas-component-helpers/move-by';
import { DeltaTime } from '../../src/delta-time/delta-time';

export class TestComponent extends CanvasComponent {
  direction: OrderedPair = { x: 3, y: 1 };

  update(deltaTime: DeltaTime): void {
    moveBy(deltaTime, this, { x: 0, y: 0 }, { x: 900, y: 500 });
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

    context.font = '10px Arial';
    context.fillStyle = 'black'; // Set desired color
    context.fillText(
      `${this.computedCoordinates.x.toFixed(1)}, ${this.computedCoordinates.y.toFixed(1)}`,
      this.computedCoordinates.x,
      this.computedCoordinates.y
    );

    context.font = '10px Arial';
    context.fillStyle = 'black'; // Set desired color
    context.fillText(
      `${this.direction.x.toFixed(1)}, ${this.direction.y.toFixed(1)}`,
      this.computedCoordinates.x + 5,
      this.computedCoordinates.y + 15
    );

    context.font = '10px Arial';
    context.fillStyle = 'black'; // Set desired color
    context.fillText(
      `${this.id}`,
      this.computedCoordinates.x + 5,
      this.computedCoordinates.y + 25
    );
  }
}