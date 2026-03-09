import Scheduler from './scheduler';

describe('Scheduler', () => {
  let scheduler: Scheduler;

  beforeEach(() => {
    scheduler = new Scheduler();
  });

  it('should fire a setTimeout callback after the specified delay', () => {
    const callback = jest.fn();
    scheduler.setTimeout(callback, 1000);

    scheduler.update(999);
    expect(callback).not.toHaveBeenCalled();

    scheduler.update(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not fire a setTimeout callback after it has been cancelled', () => {
    const callback = jest.fn();
    const id = scheduler.setTimeout(callback, 1000);

    scheduler.cancel(id);
    scheduler.update(1000);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should fire a setInterval callback repeatedly', () => {
    const callback = jest.fn();
    scheduler.setInterval(callback, 500);

    scheduler.update(500);
    expect(callback).toHaveBeenCalledTimes(1);

    scheduler.update(500);
    expect(callback).toHaveBeenCalledTimes(2);

    scheduler.update(500);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should clear all timers on destroy', () => {
    const callback = jest.fn();
    scheduler.setTimeout(callback, 500);
    scheduler.setInterval(callback, 200);

    scheduler.destroy();
    scheduler.update(1000);

    expect(callback).not.toHaveBeenCalled();
  });
});