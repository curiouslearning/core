import Scheduler from './scheduler';
import { TimeoutRegistry } from './timeout-registry';

describe('TimeoutRegistry', () => {
  let scheduler: Scheduler;
  let registry: TimeoutRegistry;

  beforeEach(() => {
    scheduler = new Scheduler();
    registry = new TimeoutRegistry(scheduler);
  });

  it('should fire a setTimeout callback after the specified delay', () => {
    const callback = jest.fn();
    registry.setTimeout(callback, 1000);

    scheduler.update(999);
    expect(callback).not.toHaveBeenCalled();

    scheduler.update(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not fire a callback after it has been cancelled', () => {
    const callback = jest.fn();
    const id = registry.setTimeout(callback, 1000);

    registry.cancel(id);
    scheduler.update(1000);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should cancel all timers on cancelAll', () => {
    const callbackA = jest.fn();
    const callbackB = jest.fn();
    registry.setTimeout(callbackA, 500);
    registry.setTimeout(callbackB, 800);

    registry.cancelAll();
    scheduler.update(1000);

    expect(callbackA).not.toHaveBeenCalled();
    expect(callbackB).not.toHaveBeenCalled();
  });

  it('should not throw when cancelling an already-fired timer', () => {
    const callback = jest.fn();
    const id = registry.setTimeout(callback, 500);

    scheduler.update(500);
    expect(callback).toHaveBeenCalledTimes(1);

    // cancel after fire should not throw
    expect(() => registry.cancel(id)).not.toThrow();
  });
});