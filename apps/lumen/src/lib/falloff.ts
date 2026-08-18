// The bench is lit by one lamp, and a station's brightness is what the lamp
// delivers at that distance: illuminance falls with the square of the
// distance. Distances here are in viewport heights, so the curve is the same
// whatever the window size.

// How fast the light falls away. Gentle on purpose: the point is to say which
// station the lamp is on, not to make the rest of the page unreadable. The
// floor that keeps dim text legible is set in the stylesheet.
const FALLOFF = 2.6;

/** Illuminance at `distance` viewport widths from the lamp, in 0..1. */
export function illuminance(distance: number): number {
  return 1 / (1 + FALLOFF * distance * distance);
}

export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
