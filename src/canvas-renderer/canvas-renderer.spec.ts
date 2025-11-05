// canvas-renderer.test.ts
import { CanvasRenderer } from './canvas-renderer';
import { DeltaTime } from '../delta-time/delta-time';
import { CanvasComponent, CanvasComponentRenderOptions } from '../canvas-component/canvas-component';

// Mock requestAnimationFrame / cancelAnimationFrame
beforeAll(() => {
  global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
    return setTimeout(() => cb(16), 0) as unknown as number;
  });
  global.cancelAnimationFrame = jest.fn();
});

// Mock classes
jest.mock('../delta-time/delta-time');

describe('CanvasRenderer', () => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let renderer: CanvasRenderer;
  let mockComponent: CanvasComponent;

  canvas = document.createElement('canvas');
  context = canvas.getContext('2d') as CanvasRenderingContext2D;
  jest.spyOn(canvas, 'getContext').mockReturnValue(context);

  (DeltaTime as jest.Mock).mockImplementation(() => ({
    tick: jest.fn(),
    hasFpsElapsed: jest.fn(() => true),
    fps: 60,
  }));

  mockComponent = new CanvasComponent({
    coordinates: { x: 0, y: 0 }
  });
  mockComponent.active = true;
  mockComponent.paused = false;

  renderer = new CanvasRenderer({ fps: 60, canvas });

  describe('Given a target canvas and a CanvasComponent that is active and not paused', () => {
    describe('When render is called with the component', () => {
      
      it('component should be updated', (done) => {
        const updateSpy = jest.spyOn(mockComponent, 'update');
        renderer.render(mockComponent);
        setTimeout(() => {
          expect(updateSpy).toHaveBeenCalled();
          done();
        }, 30);
      });

      it('component should be rendered', (done) => {
        const renderSpy = jest.spyOn(mockComponent, 'render');
        renderer.render(mockComponent);
        setTimeout(() => {
          expect(renderSpy).toHaveBeenCalledWith(
            context,
            undefined as unknown as CanvasComponentRenderOptions
          );
          done();
        }, 30);
      });

    });
  });
});
