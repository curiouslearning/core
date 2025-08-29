import { Dimension, OrderedPair } from 'src/types';

export const moveBy = (
  component: { dimension: Dimension, coordinates: OrderedPair, direction: OrderedPair },
  minBounds?: OrderedPair, maxBounds?: OrderedPair,
  boundsOffset = 1
) => {
  const { x, y } = component.coordinates;
  let { x: directionX, y: directionY } = component.direction;
  let { width, height } = component.dimension;

  if (
    // if moving left, check left bounds
    (directionX < 0 && minBounds && minBounds.x >= (x - boundsOffset))

    // or if moving right, check left bounds
    || (directionX > 0 && maxBounds && maxBounds.x < (x + width + boundsOffset))
  ) directionX *= -1;
  component.direction.x = directionX;

  // if moving up, check upper bounds
  if (
    (directionY < 0 && minBounds && minBounds.y >= y - boundsOffset)

    // if moving down, check lower bounds
    || (directionY > 0 && maxBounds && maxBounds.y < (y + height + boundsOffset))
  ) directionY *= -1;
  component.direction.y = directionY;

  component.coordinates.x += directionX;
  component.coordinates.y += directionY;
};
