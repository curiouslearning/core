import Scheduler, { TimerId } from './scheduler';

export class TimeoutRegistry {
  private timeouts: Set<TimerId> = new Set();
  private scheduler: Scheduler;

  constructor(scheduler: Scheduler) {
    this.scheduler = scheduler;
  }

  setTimeout(callback: () => void, delay: number): TimerId {
    const timerId = this.scheduler.setTimeout(() => {
      this.timeouts.delete(timerId);
      callback();
    }, delay);
    this.timeouts.add(timerId);
    return timerId;
  }

  cancel(timerId: TimerId | null | undefined): void {
    if (timerId === null || timerId === undefined) {
      return;
    }
    this.scheduler.cancel(timerId);
    this.timeouts.delete(timerId);
  }

  cancelAll(): void {
    try {
      for (const timerId of this.timeouts) {
        this.scheduler.cancel(timerId);
      }
    } finally {
      this.timeouts.clear();
    }
  }
}
