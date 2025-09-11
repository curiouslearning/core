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
jest.mock('../canvas-component/canvas-component');

describe('CanvasRenderer', () => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let renderer: CanvasRenderer;
  let mockComponent: jest.Mocked<CanvasComponent>;

  canvas = document.createElement('canvas');
  context = canvas.getContext('2d') as CanvasRenderingContext2D;
  jest.spyOn(canvas, 'getContext').mockReturnValue(context);

  (DeltaTime as jest.Mock).mockImplementation(() => ({
    tick: jest.fn(),
    hasFpsElapsed: jest.fn(() => true),
    fps: 60,
  }));

  mockComponent = {
    active: true,
    paused: false,
    update: jest.fn(),
    render: jest.fn(),
    children: [],
    computedCoordinates: { x: 0, y: 0 },
  } as unknown as jest.Mocked<CanvasComponent>;

  renderer = new CanvasRenderer({ fps: 60, canvas });

  describe('Given a target canvas and a CanvasComponent that is active and not paused', () => {
    describe('When render is called with the component', () => {
      renderer.render(mockComponent);

      it('component should be updated', (done) => {
        setTimeout(() => {
          expect(mockComponent.update).toHaveBeenCalled();
          done();
        }, 20);
      });

      it('component should be rendered', (done) => {
        
        setTimeout(() => {
          expect(mockComponent.render).toHaveBeenCalledWith(context, undefined as unknown as CanvasComponentRenderOptions);
          done();
        }, 20);
      });
    });
  });
});
