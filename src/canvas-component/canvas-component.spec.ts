import { CanvasComponent } from './canvas-component';
import { OrderedPair } from '../types';
import { DeltaTime } from '../delta-time/delta-time';

class TestCanvasComponent extends CanvasComponent {
  public updateCalled = false;
  public renderCalled = false;

  override update(deltaTime: DeltaTime) {
    this.updateCalled = true;
    super.update(deltaTime);
  }

  override render(context: CanvasRenderingContext2D, options?: any) {
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
    let context: CanvasRenderingContext2D;
    let component: TestCanvasComponent;
    context = mockContext();

    component = new TestCanvasComponent({
      coordinates: { x: 10, y: 20 },
      dimension: { width: 100, height: 200 }
    });

    it('should contain computed coordinates including offsets', () => {
      component.offset = { x: 5, y: 5 };
      expect(component.computedCoordinates).toEqual({ x: 15, y: 25 });
    });
  });

  describe('Given the default id', () => {
    const component = new TestCanvasComponent({
      coordinates: { x: 10, y: 20 },
      dimension: { width: 100, height: 200 }
    });

    it('should have an id', () => {
      expect(component.id).toBeTruthy();
    });

    it('should contain class name', () => {
      expect(component.id).toContain('TestCanvasComponent');
    });

    describe('Given a child component with id=test', () => {
      const component2 = new TestCanvasComponent({
        id: 'test'
      });

      describe('When getChildById() is called', () => {
        it('should yield the child component', () => {
          component.children.push(component2);
          const child = component.getChildById('test');

          expect(child).toEqual(component2);
        });
      });
    });
  });
});
