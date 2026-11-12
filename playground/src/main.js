import { MotionController } from "./motion.js";
import { createMoss } from "./character.js";
import { createWorld } from "./world.js";
import { createSpatialAdapter } from "./adapter.js";
const $ = (id) => document.getElementById(id);
try {
  const world = createWorld($("scene")),
    moss = createMoss(),
    spatial = createSpatialAdapter();
  world.scene.add(moss.root);
  const names = {
    SeatedWorking: "Working at workstation",
    StoppingWork: "Preparing to move",
    StandingUp: "Standing up",
    Turning: "Turning",
    Walking: "Walking to lounge",
    StandingIdle: "Ready to sit",
    SittingDown: "Sitting down",
    Settling: "Settling in",
    SeatedResting: "Resting",
    ReturningToWork: "Returning to workstation",
  };
  const descriptions = {
    SeatedWorking:
      "Moss is seated and typing. Send him to the lounge when you’re ready.",
    SeatedResting:
      "Moss will stay here until you ask him to return. Watch for a blink or a small resting gesture.",
    StandingUp: "Feet stay planted as hips rise and knees straighten.",
    Turning: "Moss turns to face the next part of the route.",
    Walking: "A clear aisle keeps the route away from furniture.",
    ReturningToWork: "Following the aisle back to the workstation.",
    SittingDown: "Hips and knees bend as Moss settles into the seat.",
    StoppingWork: "Arms leave the keyboard before Moss rises.",
    Settling: "Adjusting posture to the new seat.",
    StandingIdle: "Aligned with the seat before lowering.",
  };
  let entries = [],
    paused = false,
    reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
    last = performance.now(),
    motion;
  $("reduced").checked = reduced;
  function changed(s) {
    entries.unshift({ time: s.time, name: names[s.state] });
    entries = entries.slice(0, 5);
    $("events").replaceChildren(
      ...entries.map((e) => {
        const li = document.createElement("li"),
          t = document.createElement("time");
        t.textContent = e.time.toFixed(1) + "s";
        li.append(t, document.createTextNode(e.name));
        return li;
      }),
    );
    $("state").textContent = names[s.state];
    $("detail").textContent = descriptions[s.state];
    $("lounge").disabled = s.busy || s.location === "lounge";
    $("desk").disabled = s.busy || s.location === "desk";
    $("demo").disabled = s.busy || s.location !== "desk";
    $("location").textContent = s.busy
      ? s.destination === "lounge"
        ? "WORKSTATION → LOUNGE"
        : "LOUNGE → WORKSTATION"
      : s.location === "desk"
        ? "WORKSTATION"
        : "LOUNGE";
  }
  motion = new MotionController(changed);
  function frame(dt, draw = true) {
    const before = motion.destination;
    motion.update(dt);
    const s = motion.snapshot();
    if (!before && s.destination) spatial.begin(s.destination);
    spatial.update(s);
    moss.update(s, reduced);
    if (draw) world.render(moss.root);
    $("progress").style.width = s.progress * 100 + "%";
  }
  function move(destination) {
    if (motion.busy || motion.location === destination) return false;
    spatial.begin(destination);
    const accepted = motion.move(destination);
    frame(0);
    return accepted;
  }
  function reset() {
    entries = [];
    spatial.reset();
    motion.reset();
    paused = false;
    $("pause").textContent = "Pause animation";
    frame(0);
  }
  $("lounge").onclick = () => move("lounge");
  $("desk").onclick = () => move("desk");
  $("demo").onclick = () => {
    if (move("lounge")) motion.demo = true;
  };
  $("reset").onclick = reset;
  $("camera").onchange = () => {
    world.setCamera($("camera").value);
    frame(0);
  };
  $("reduced").onchange = () => {
    reduced = $("reduced").checked;
    frame(0);
  };
  $("pause").onclick = () => {
    paused = !paused;
    $("pause").textContent = paused ? "Resume animation" : "Pause animation";
  };
  function tick(now) {
    if (now - last >= 1000 / 30) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!document.hidden && !paused) frame(dt * Number($("speed").value));
    }
    requestAnimationFrame(tick);
  }
  frame(0);
  requestAnimationFrame(tick);
  window.addEventListener("resize", () => frame(0));
  // Deterministic inspection surface: the same controller and renderer used by playback.
  window.mossPlayground = {
    move,
    reset,
    pause(value = true) {
      paused = value;
      $("pause").textContent = paused ? "Resume animation" : "Pause animation";
    },
    advance(seconds) {
      for (let t = 0; t < seconds; t += 1 / 60)
        frame(Math.min(1 / 60, seconds - t), false);
      frame(0);
    },
    snapshot() {
      return { ...motion.snapshot(), space: spatial.snapshot() };
    },
    render: () => frame(0),
  };
  // Expose only numeric diagnostic joint positions, not application identity or storage.
  window.mossPlayground.inspect = () => {
    world.scene.updateMatrixWorld(true);
    const pos = (o) => {
      const a = o.matrixWorld.elements;
      return [a[12], a[13], a[14]];
    };
    return {
      hips: pos(moss.hips),
      feet: moss.legs.map((l) => pos(l.ankle)),
      eyes: moss.eyes.map((e) => e.scale.y),
      limbLengths: moss.legs.map((l) => [
        l.knee.position.length(),
        l.ankle.position.length(),
      ]),
      drawCalls: world.renderer.info.render.calls,
    };
  };
} catch (error) {
  $("error").hidden = false;
  $("error").textContent =
    "The 3D preview could not start. Use an up-to-date Chrome or Edge browser with graphics acceleration enabled. " +
    error.message;
  for (const id of ["lounge", "desk", "demo", "reset", "pause"])
    $(id).disabled = true;
  console.error(error);
}
