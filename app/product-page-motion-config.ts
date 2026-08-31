export const PRODUCT_PAGE_MOTION_FACTOR = 0.79;

export function productPageMotionDuration(durationMs: number) {
  return Math.round(durationMs * PRODUCT_PAGE_MOTION_FACTOR);
}
