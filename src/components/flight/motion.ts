/**
 * Motion helpers for the flight scenes.
 *
 * Keyframes everywhere else in the app are piecewise-linear, which makes a plane
 * visibly stall and jump at every boundary. These helpers integrate a *speed*
 * profile instead, so position is C1 continuous: the aircraft accelerates and
 * decelerates like mass instead of snapping between keyframes.
 */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const smoothstep = (a: number, b: number, t: number) => {
  const k = clamp01((t - a) / (b - a || 1e-6));
  return k * k * (3 - 2 * k);
};

export const smootherstep = (t: number) => {
  const k = clamp01(t);
  return k * k * k * (k * (k * 6 - 15) + 10);
};

/** Frame-rate independent damping factor: use as lerp(current, target, damp(dt, rate)). */
export const damp = (dt: number, rate: number) => 1 - Math.exp(-rate * Math.max(0, dt));

export type SpeedKey = [t: number, speed: number];

/**
 * Integrate a piecewise-linear speed profile over normalised time (0..1).
 * Returns `at(t)` -> distance travelled, `speed(t)` -> current speed and `total`.
 */
export function speedProfile(keys: SpeedKey[]) {
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
  const dist: number[] = [0];

  for (let i = 1; i < keys.length; i++) {
    const dt = ts[i] - ts[i - 1];
    dist.push(dist[i - 1] + ((vs[i] + vs[i - 1]) / 2) * dt);
  }

  const total = dist[dist.length - 1];

  const seg = (t: number) => {
    let i = 1;
    while (i < ts.length - 1 && t > ts[i]) i++;
    return i;
  };

  const at = (t: number) => {
    if (t <= ts[0]) return dist[0] + (t - ts[0]) * vs[0];
    if (t >= ts[ts.length - 1]) return total + (t - ts[ts.length - 1]) * vs[vs.length - 1];
    const i = seg(t);
    const dt = ts[i] - ts[i - 1];
    const k = (t - ts[i - 1]) / dt;
    const v0 = vs[i - 1];
    const v1 = vs[i];
    return dist[i - 1] + (v0 * k + ((v1 - v0) * k * k) / 2) * dt;
  };

  const speed = (t: number) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[ts.length - 1]) return vs[vs.length - 1];
    const i = seg(t);
    const k = (t - ts[i - 1]) / (ts[i] - ts[i - 1]);
    return vs[i - 1] + (vs[i] - vs[i - 1]) * k;
  };

  return { at, speed, total };
}

/** Ground roll + rotation + climb out, speeds in scene units per second of the clip. */
export const TAKEOFF_SPEED = speedProfile([
  [0, 4], // slow taxi, engines at idle
  [0.14, 6],
  [0.56, 92], // take-off roll: linear acceleration, no stall at the boundary
  [0.66, 104], // rotate
  [0.82, 118],
  [1, 132], // climb out
]);

/** Approach, flare, touchdown, deceleration to taxi speed. */
export const LANDING_SPEED = speedProfile([
  [0, 132], // final approach, high and fast
  [0.52, 118], // over the threshold
  [0.68, 86], // touchdown
  [0.82, 34], // braking
  [1, 7], // taxiing off
]);
