// delta-time.test.ts
import { DeltaTime } from './delta-time';

describe('DeltaTime', () => {
  describe('Given a DeltaTime instance with fps = 60', () => {
    const deltaTime = new DeltaTime(60);
    const frame1 = 16; // first frame
    const frame2 = 32; // second frame, simulating ~16ms later

    
    describe('When constructed', () => {
      it('should have the expected fps', () => {
        expect(deltaTime.fps).toBe(60);
      });

      it('should have the correct interval', () => {
        expect(deltaTime.interval).toBeCloseTo(1000 / 60);
      });

      it('should have the expected delta', () => {
        expect(deltaTime.dt).toBeCloseTo(1 / 60);
      });
    });

    describe('When tick(16)', () => {
      beforeAll(() => {
        deltaTime.tick(frame1);
      });
      

      it('current should be 16', () => {
        expect(deltaTime.current).toBe(frame1);
      });

      it('delta should be the expected value', () => {
        expect(deltaTime.delta).toBe(frame1 - 0);
      });

      it('last should be 16', () => {
        expect(deltaTime.last).toBe(frame1);
      });
    });

    describe('When tick(32)', () => {
      beforeAll(() => {
        deltaTime.tick(frame2);
      });

      it('current should be 32', () => {
        expect(deltaTime.current).toBe(frame2);
      });

      it('delta should be the expected value', () => {
        expect(deltaTime.delta).toBe(frame2 - frame1);
      });

      it('last should be 32', () => {
        expect(deltaTime.last).toBe(frame2);
      });
    });
  });
});
