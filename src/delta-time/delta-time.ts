export class DeltaTime {
  delta: number = 0;
  dt: number = 0;
  fps: number = 0;

  /**
   * Number of frames since last render.
   */
  ellapsedFrames: number = 0;
  current: number = 0;
  last: number = 0;
  lastFrame: number = 0;

  /**
   * Frame interval
   */
  interval: number = 0;

  constructor(fps: number) {
    this.fps = fps;
    this.interval = 1000 / fps;
    this.dt = 1 / fps;
  }

  tick(current: number) {
    this.current = current;
    this.delta = (current - this.last);
    this.last = current;
    this.ellapsedFrames = current - this.lastFrame;

    if (this.hasFpsElapsed()) {
      this.lastFrame = current - (this.ellapsedFrames % this.interval);
    }
  }

  hasFpsElapsed() {
    return this.ellapsedFrames >= this.interval || !this.interval;
  }
}