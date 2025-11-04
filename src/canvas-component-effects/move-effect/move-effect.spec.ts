import { MoveEffect } from './move-effect';

describe('MoveEffect (Happy Path)', () => {
  let mockComponent: any;
  let options: any;
  let deltaTime: any;
  let moveEffect: MoveEffect;

  beforeEach(() => {
    mockComponent = {
      coordinates: { x: 50, y: 50 },
      dimension: { width: 10, height: 10 },
    };

    options = {
      componentRef: mockComponent,
      speed: { x: 5, y: 0 },
      minBounds: { x: 0, y: 0 },
      maxBounds: { x: 100, y: 100 },
      boundsOffset: 0,
    };

    deltaTime = { dt: 1, delta: 16, fps: 60 };
    moveEffect = new MoveEffect(options);
  });

  /**
   * Scenario: The component moves right within bounds
   *   Given a MoveEffect with speed (x=5)
   *   When update() is called with dt=1
   *   Then the x coordinate should increase by 5
   */
  it('should move right within bounds', () => {
    moveEffect.update(deltaTime);

    expect(mockComponent.coordinates.x).toBe(55);
  });

  /**
   * Scenario: The component keeps its Y position if no vertical speed
   *   Given a MoveEffect with speed (y=0)
   *   When update() is called
   *   Then the y coordinate should remain unchanged
   */
  it('should not change Y when vertical speed is zero', () => {
    moveEffect.update(deltaTime);

    expect(mockComponent.coordinates.y).toBe(50);
  });

  /**
   * Scenario: The component reverses direction when hitting right bound
   *   Given a MoveEffect moving right near maxBounds
   *   When update() is called
   *   Then the x speed should reverse
   */
  it('should reverse X direction when hitting right bound', () => {
    mockComponent.coordinates.x = 95; // near maxBounds
    moveEffect.options.speed = { x: 5, y: 0 };

    moveEffect.update(deltaTime);

    expect(moveEffect.options.speed.x).toBe(-5);
  });

  /**
   * Scenario: The component reverses direction when hitting left bound
   *   Given a MoveEffect moving left near minBounds
   *   When update() is called
   *   Then the x speed should reverse
   */
  it('should reverse X direction when hitting left bound', () => {
    mockComponent.coordinates.x = 0;
    moveEffect.options.speed = { x: -5, y: 0 };

    moveEffect.update(deltaTime);

    expect(moveEffect.options.speed.x).toBe(5);
  });

  /**
   * Scenario: The component reverses direction when hitting bottom bound
   *   Given a MoveEffect moving down near maxBounds
   *   When update() is called
   *   Then the y speed should reverse
   */
  it('should reverse Y direction when hitting bottom bound', () => {
    mockComponent.coordinates.y = 95;
    moveEffect.options.speed = { x: 0, y: 5 };


    moveEffect.update(deltaTime);

    expect(moveEffect.options.speed.y).toBe(-5);
  });

  /**
   * Scenario: The component reverses direction when hitting top bound
   *   Given a MoveEffect moving up near minBounds
   *   When update() is called
   *   Then the y speed should reverse
   */
  it('should reverse Y direction when hitting top bound', () => {

    mockComponent.coordinates.y = 0;
    moveEffect.options.speed = { x: 0, y: -5 };

    moveEffect.update(deltaTime);

    expect(moveEffect.options.speed.y).toBe(5);
  });
});
