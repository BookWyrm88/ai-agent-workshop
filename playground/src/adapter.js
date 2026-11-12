import { SEATS } from "./motion.js";
// Uses the production reservation/arrival model with an in-memory fixture only.
export function createSpatialAdapter() {
  const api = window.WorkshopSpatial,
    id = "moss-playground";
  const identity = Object.freeze({
    id,
    name: "Moss",
    lifecycle: "active",
    color: "#78c9b5",
    symbol: "leaf",
    version: 1,
  });
  let state;
  const project = (p) => ({ x: 600 + p.x * 100, y: 400 + p.z * 100 });
  const zoneId = (destination) =>
    destination === "desk" ? api.workId(id) : "lounge";
  function reset() {
    state = { agents: [identity] };
    api.sync(state);
    state.space.zones = state.space.zones.filter((z) =>
      [zoneId("desk"), "lounge"].includes(z.id),
    );
    for (const name of ["desk", "lounge"]) {
      const z = api.zone(state, zoneId(name));
      z.position = project(SEATS[name]);
      z.seats = [{ ...z.position }];
    }
    state.space.locations[id].position = project(SEATS.desk);
    api.sync(state);
  }
  reset();
  return {
    identity,
    reset,
    begin(destination) {
      return api.move(state, id, zoneId(destination), "Animation rehearsal");
    },
    update(s) {
      state.space.locations[id].position = project(s.position);
      if (!s.busy && state.space.locations[id].move) api.arrive(state, id);
    },
    snapshot() {
      return structuredClone(state.space);
    },
  };
}
