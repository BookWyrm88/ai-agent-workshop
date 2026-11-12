// Animation-only state machine. No DOM, storage or task execution dependencies.
export const BUILD = "MOSS / 0.1.0 • motion study";
export const WALK_SPEED = 0.92,
  WALK_CYCLE = 0.74;
export const SEATS = {
  desk: { x: 2, z: -0.65, y: 0.63 },
  lounge: { x: -2.25, z: -0.9, y: 0.63 },
};
const smooth = (t) => t * t * (3 - 2 * t);
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
export class MotionController {
  constructor(onEvent = () => {}) {
    this.onEvent = onEvent;
    this.reset();
  }
  reset() {
    this.time = 0;
    this.elapsed = 0;
    this.location = "desk";
    this.destination = null;
    this.state = "SeatedWorking";
    this.position = { x: SEATS.desk.x, z: SEATS.desk.z };
    this.yaw = 0;
    this.sit = 1;
    this.lean = 0.1;
    this.arm = 1;
    this.gait = 0;
    this.steps = [];
    this.demo = false;
    this.restTime = 0;
    this.onEvent(this.snapshot());
  }
  get busy() {
    return this.steps.length > 0;
  }
  snapshot() {
    return {
      state: this.state,
      location: this.location,
      destination: this.destination,
      position: { ...this.position },
      yaw: this.yaw,
      sit: this.sit,
      lean: this.lean,
      arm: this.arm,
      gait: this.gait,
      time: this.time,
      progress: this.steps[0]
        ? Math.min(1, this.elapsed / this.steps[0].duration)
        : 1,
      busy: this.busy,
    };
  }
  move(destination) {
    if (this.busy || destination === this.location || !SEATS[destination])
      return false;
    this.destination = destination;
    const from = SEATS[this.location],
      to = SEATS[destination];
    const stand = { x: from.x, z: from.z + 0.4 },
      approach = { x: to.x, z: to.z + 0.4 };
    const waypoints =
      destination === "lounge"
        ? [
            { x: 0.8, z: stand.z },
            { x: 0.8, z: 1.25 },
            { x: -2.25, z: 1.25 },
            approach,
          ]
        : [
            { x: -2.25, z: 1.25 },
            { x: 0.8, z: 1.25 },
            { x: 0.8, z: approach.z },
            approach,
          ];
    const steps = [
      { state: "StoppingWork", duration: 0.6, to: { arm: 0, lean: 0.16 } },
      {
        state: "StandingUp",
        duration: 1.75,
        to: { position: stand, sit: 0, lean: 0, arm: 0 },
      },
    ];
    let point = stand,
      heading = 0;
    for (const p of waypoints) {
      const dx = p.x - point.x,
        dz = p.z - point.z,
        angle = Math.atan2(dx, dz);
      steps.push({
        state: "Turning",
        duration: Math.max(0.35, Math.abs(angleDelta(heading, angle)) * 0.38),
        to: { yaw: angle },
      });
      steps.push({
        state: destination === "desk" ? "ReturningToWork" : "Walking",
        duration: Math.hypot(dx, dz) / 0.92,
        to: { position: p },
      });
      point = p;
      heading = angle;
    }
    steps.push({
      state: "Turning",
      duration: Math.max(0.4, Math.abs(angleDelta(heading, 0)) * 0.38),
      to: { yaw: 0 },
    });
    steps.push({ state: "StandingIdle", duration: 0.3, to: {} });
    steps.push({
      state: "SittingDown",
      duration: 1.85,
      to: { position: { x: to.x, z: to.z }, sit: 1, lean: 0.1 },
    });
    steps.push({
      state: "Settling",
      duration: 0.7,
      to: {
        arm: destination === "desk" ? 1 : 0,
        lean: destination === "desk" ? 0.1 : -0.05,
      },
    });
    this.steps = steps;
    this.enter();
    return true;
  }
  enter() {
    this.elapsed = 0;
    const s = this.steps[0];
    s.from = {
      position: { ...this.position },
      sit: this.sit,
      lean: this.lean,
      arm: this.arm,
      yaw: this.yaw,
    };
    this.state = s.state;
    if (["Walking", "ReturningToWork"].includes(s.state))
      this.gait = Math.PI / 2;
    this.onEvent(this.snapshot());
  }
  update(dt) {
    if (!Number.isFinite(dt) || dt < 0) return;
    this.time += dt;
    if (!this.busy) {
      if (this.state === "SeatedResting") {
        this.restTime += dt;
        if (this.demo && this.restTime > 5) {
          this.demo = false;
          this.move("desk");
        }
      }
      return;
    }
    let remaining = dt;
    while (remaining > 0 && this.steps.length) {
      const s = this.steps[0],
        used = Math.min(remaining, s.duration - this.elapsed);
      this.elapsed += used;
      remaining -= used;
      const walking = ["Walking", "ReturningToWork"].includes(s.state),
        t = Math.min(1, this.elapsed / s.duration),
        u = walking ? t : smooth(t);
      for (const k of ["sit", "lean", "arm"])
        if (k in s.to) this[k] = s.from[k] + (s.to[k] - s.from[k]) * u;
      if (s.to.position) {
        const p = s.to.position,
          f = s.from.position,
          old = { ...this.position };
        this.position = { x: f.x + (p.x - f.x) * u, z: f.z + (p.z - f.z) * u };
        if (walking)
          this.gait +=
            ((Math.hypot(this.position.x - old.x, this.position.z - old.z) /
              WALK_SPEED) *
              Math.PI *
              2) /
            WALK_CYCLE;
      }
      if ("yaw" in s.to)
        this.yaw = s.from.yaw + angleDelta(s.from.yaw, s.to.yaw) * u;
      if (t >= 1) {
        this.steps.shift();
        if (this.steps.length) this.enter();
        else {
          this.location = this.destination;
          this.destination = null;
          this.state =
            this.location === "desk" ? "SeatedWorking" : "SeatedResting";
          this.restTime = 0;
          this.onEvent(this.snapshot());
        }
      }
    }
  }
}
