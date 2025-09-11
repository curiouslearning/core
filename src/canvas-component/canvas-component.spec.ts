import { CanvasComponent } from './canvas-component';
import { DeltaTime, OrderedPair } from '../types';

class TestCanvasComponent extends CanvasComponent {
  public updateCalled = false;
  public renderCalled = false;

  update(deltaTime: DeltaTime) {
    this.updateCalled = true;
    super.update(deltaTime);
  }

  render(context: CanvasRenderingContext2D, options?: any) {
    this.renderCalled = true;
    super.render(context, options);
  }
}

const mockContext = () => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    measureText: jest.fn().mockReturnValue({ width: 0 }),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn()
  } as unknown as CanvasRenderingContext2D
);

describe('CanvasComponent', () => {
  describe('Given an active and unpaused CanvasComponent', () => {

    describe('When the render lifecycle is run', () => {
      let context: CanvasRenderingContext2D;
      let component: TestCanvasComponent;

      beforeEach(() => {
        // Mock canvas context
        context = mockContext();

        component = new TestCanvasComponent({
          coordinates: { x: 10, y: 20 },
          dimension: { width: 100, height: 200 }
        });

        // Arrange
        const deltaTime: DeltaTime = { current: 16 };
        const offset: OrderedPair = { x: 5, y: 5 };

        // Act
        component.render(context, { deltaTime, offset });
      });

      it('should call update', () => {
        
        expect(component.updateCalled).toBe(true);
      });

      it('should call render', () => {
        expect(component.renderCalled).toBe(true);
      });

      it('should contain computed coordinates including offsets', () => {
        expect(component.computedCoordinates).toEqual({ x: 15, y: 25 });
      });
    });
  });
});
