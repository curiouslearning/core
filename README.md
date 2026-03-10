# core
A collection of reusable core features, classes and functionalities used to create web-based apps and games.

# SchedulerService

A game-loop-driven timer scheduler that respects pause state. Provides `setTimeout` equivalents driven by `deltaTime` instead of the browser clock — so timers pause when your game pauses.

---

## Usage

### 1. Wire the game loop

Call `update()` every frame. Skip it when paused — timers will naturally pause too.

```typescript
import schedulerService from '@curiouslearning/core';

draw(deltaTime: number) {
  if (!this.isPaused) {
    schedulerService.update(deltaTime);
  }
}
```

> **Note:** If used outside of `requestAnimationFrame` — for example in a custom loop that may produce high or unpredictable delta values — it is recommended to cap the delta time to prevent timers from misfiring:
> ```typescript
> const MAX_DELTA_MS = 100;
> schedulerService.update(Math.min(deltaTime, MAX_DELTA_MS));
> ```


---

### 2. Create a registry per component

Call `createRegistry()` to get a `TimeoutRegistry` scoped to your component. Schedule timers through the registry and call `cancelAll()` on teardown.

```typescript
import schedulerService from '@curiouslearning/core';
import type { TimeoutRegistry, TimerId } from '@curiouslearning/schedulerService';

class TutorialHandler {
  private registry: TimeoutRegistry = schedulerService.createRegistry();
  private timerId: TimerId | null = null;

  startDelay() {
    this.timerId = this.registry.setTimeout(() => {
      this.onDelayComplete();
    }, 6000);
  }

  reset() {
    this.registry.cancel(this.timerId);
    this.timerId = null;
  }

  destroy() {
    this.registry.cancelAll();
  }
}
```

---

## API

### `schedulerService`

The singleton instance. Import and use directly.

| Method | Description |
|---|---|
| `update(delta: number)` | Ticks all active timers. Must be called every frame from the game loop. |
| `createRegistry()` | Returns a new `TimeoutRegistry` instance scoped to a component or entity. |
| `destroy()` | Clears all active timers. Call on full game teardown. |

---

### `TimeoutRegistry`

Returned by `schedulerService.createRegistry()`. Manages timers scoped to a single component or entity.

| Method | Description |
|---|---|
| `setTimeout(callback, delay)` | Schedules a one-time callback after `delay` ms. Returns a `TimerId`. Auto-removes itself from the registry after firing. |
| `cancel(id)` | Cancels a specific timer by ID. Safely accepts `null` or `undefined`. |
| `cancelAll()` | Cancels all timers owned by this registry. Call on component teardown. |
