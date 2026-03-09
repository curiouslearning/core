import Scheduler from './scheduler';
import { TimeoutRegistry } from './timeout-registry';
import type { TimerId } from './scheduler';

class SchedulerService {
  // Make scheduler a singleton.
  private scheduler = new Scheduler();

  /**
   * Drives all active timers. Must be called every frame from the game loop.
   * @param delta Time elapsed since last frame in milliseconds.
   */
  update(delta: number): void {
    this.scheduler.update(delta);
  }

  /**
   * Creates a new TimeoutRegistry instance scoped to a component or entity.
   * Use the returned registry to schedule and manage timers tied to that scope.
   * Call registry.cancelAll() on component teardown.
   * @returns A new TimeoutRegistry instance.
   */
  createRegistry(): TimeoutRegistry {
    return new TimeoutRegistry(this.scheduler);
  }

  /**
   * Clears all active timers across all registries.
   * Call on full game teardown.
   */
  destroy(): void {
    this.scheduler.destroy();
  }
}

export const schedulerService = new SchedulerService();
export type { TimerId };
export type { TimeoutRegistry };