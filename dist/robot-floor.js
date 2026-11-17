/* Neon floor: persist one DOM node per operator. Execution and arrivals remain owned by the application. */
window.RobotFloor = (() => {
  const text = (node, value) => {
    if (node.textContent !== String(value)) node.textContent = value;
  };
  const safe = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const spot = (s, id, p) => {
    const zone = WorkshopSpatial.zone(s, id);
    return id === "lounge"
      ? {
          475: { x: 88, y: 359 },
          490: { x: 151, y: 356 },
          560: { x: 91, y: 425 },
        }[p.y] || p
      : zone?.type === "workstation"
        ? { x: p.x - 8, y: p.y - 62 * WorkshopSpatial.slot(zone.index).scale }
        : p;
  };
  const types = {
    task: "ACTIVITY",
    plan: "STATUS",
    speech: "MESSAGE",
    attention: "ATTENTION",
  };
  const until = 4500;
  function activity(s, a, status, now) {
    const l = s.space.locations[a.id],
      records = s.runs.filter((r) => r.agentId === a.id);
    const r =
      records.find((r) =>
        ["working", "using-tool", "paused"].includes(r.status),
      ) ||
      records.find((r) => r.status === "waiting") ||
      records.find((r) => r.status === "queued") ||
      records[0];
    const event = r?.events.at(-1),
      handoff = s.handoffs.findLast(
        (h) =>
          (h.senderId === a.id || h.recipientId === a.id) &&
          now - Date.parse(h.at) < until,
      );
    const compact = (kind, label, pose, detail, extra = {}) => ({
      kind,
      label,
      pose,
      detail,
      run: r,
      ...extra,
    });
    const pose = l.move
      ? "walking"
      : l.zoneId === "lounge"
        ? "resting"
        : r?.status === "working" || r?.status === "using-tool"
          ? "working"
          : "idle";
    if (r?.status === "waiting")
      return compact(
        "attention",
        "Approval needed",
        pose,
        "Review the saved assignment in Task Queue before this operator can begin.",
      );
    if (handoff) {
      const sending = handoff.senderId === a.id;
      return compact(
        "speech",
        sending
          ? "Sent to " + handoff.recipientName
          : "From " + handoff.senderName,
        pose,
        sending
          ? "Delivered the recorded research output."
          : "Received a research result for evaluation.",
        { handoff },
      );
    }
    if (l.move) {
      const dest = WorkshopSpatial.zone(s, l.move.toZoneId);
      return compact(
        "plan",
        "To " + (dest.type === "workstation" ? "workstation" : dest.name),
        pose,
        l.move.reason + " · Destination reserved.",
      );
    }
    if (r?.status === "paused")
      return compact(
        "attention",
        "Paused by you",
        pose,
        "Resume the task to continue its recorded sequence.",
      );
    if (r?.status === "queued")
      return compact(
        "plan",
        s.queuePaused[a.id] ? "Queue on hold" : "Task queued",
        pose,
        "Assigned: " + r.task,
      );
    if (pose === "resting")
      return compact(
        "plan",
        "Resting",
        pose,
        "Seated in the lounge. A new assignment can call this operator back to its desk.",
      );
    if (["failed", "cancelled"].includes(r?.status))
      return compact(
        "attention",
        r.status === "failed" ? "Task failed" : "Cancelled",
        pose,
        event?.data.error || event?.label || r.status,
      );
    if (r?.status === "completed")
      return compact(
        "task",
        "Task completed",
        pose,
        r.task + " · Result available in Laboratory.",
      );
    if (r)
      return compact(
        "task",
        event?.label || status,
        pose,
        r.task + " · " + (event?.label || status),
      );
    return compact(
      "plan",
      "Available",
      pose,
      "No task assigned · " + WorkshopSpatial.zone(s, l.zoneId).name + ".",
    );
  }
  function shell() {
    return '<div id="floor-mount" class="shared-room headquarters robot-hq"></div>';
  }
  // Replace the chrome around the floor without removing the floor or its ancestors.
  function shellUpdate(app, html) {
    const old = app.querySelector("#floor-mount");
    if (!old || !html.includes('id="floor-mount"')) {
      app.innerHTML = html;
      return;
    }
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    let left = old,
      right = tpl.content.querySelector("#floor-mount");
    while (left !== app) {
      const parent = left.parentNode,
        other = right.parentNode;
      while (left.previousSibling) left.previousSibling.remove();
      while (left.nextSibling) left.nextSibling.remove();
      while (right.previousSibling) parent.insertBefore(other.firstChild, left);
      while (right.nextSibling) parent.append(right.nextSibling);
      if (parent !== app && parent.nodeType === 1)
        for (const attr of other.attributes)
          parent.setAttribute(attr.name, attr.value);
      left = parent;
      right = other;
    }
  }
  let current = null,
    resize = null,
    visibility = null,
    expiry = null,
    actors = new Map(),
    desks = new Map(),
    routes = new Map(),
    selection = null,
    commands = null;
  function release() {
    clearTimeout(expiry);
    resize?.disconnect();
    visibility?.disconnect();
    current = null;
    commands = null;
    actors.clear();
    desks.clear();
    routes.clear();
  }
  function mount(el) {
    clearTimeout(expiry);
    resize?.disconnect();
    current = el;
    actors = new Map();
    desks = new Map();
    routes = new Map();
    selection = null;
    el.innerHTML = `<div class="floor-bar"><span class="floor-kicker"><i></i> OPERATIONS FLOOR</span><span class="floor-count"></span><span class="floor-sim">LOCAL SIMULATION</span></div><div class="room-scroll" tabindex="0" aria-label="Scrollable operations floor"><div class="room-world hq-world"><div class="hq-architecture"></div><div class="hq-floor-extension"></div><div class="studio-sign hq-sign">NOCTURNE<small>OPERATOR HEADQUARTERS</small></div><div class="station-grid hq-stations" style="--columns:3"></div><div class="spatial-zones"></div><svg class="floor-paths" aria-hidden="true"></svg><div class="floor-actors"></div><div class="floor-links"></div></div></div><div class="floor-dispatch"><div class="floor-kicker">OPERATOR SIGNAL <span> / SIMULATED</span></div><div class="signal-title"></div><p class="signal-detail"></p><div class="signal-tools"><button data-floor="sample">Run sample task</button><button data-floor="task" data-scene-console>Write a task ↗</button><button data-floor="move"></button><button data-floor="relay">Research → Evaluation</button><button data-floor="inspect"></button></div></div>`;
    el.insertBefore(
      el.querySelector(".floor-dispatch"),
      el.querySelector(".room-scroll"),
    );
    const history = document.createElement("details");
    history.className = "floor-history";
    history.innerHTML = "<summary>Recent signals</summary><ol></ol>";
    el.append(history);
    el.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button || !commands) return;
      const { action } = commands;
      if (button.dataset.signal) {
        const a = actors.get(button.dataset.signal);
        if (a?.info.handoff) action("handoff", a.info.handoff.id);
        else action("signal", button.dataset.signal);
      } else if (button.dataset.floor) action(button.dataset.floor);
      else if (button.dataset.packet) action("handoff", button.dataset.packet);
    });
    if (window.IntersectionObserver) {
      visibility = new IntersectionObserver(
        (entries) =>
          entries.forEach(({ target, isIntersecting }) => {
            target.parentElement.dataset.onscreen = isIntersecting;
          }),
        { root: el.querySelector(".room-scroll") },
      );
    }
    if (window.ResizeObserver) {
      resize = new ResizeObserver(() => fit());
      resize.observe(el);
    }
  }
  function fit() {
    if (!current?.isConnected) return;
    const w = current.querySelector(".hq-world");
    const ratio =
      Math.min(1, Math.max(0.68, current.clientWidth / 1200)) *
      (Number(current.dataset.zoom) || 1);
    if (current.clientWidth) {
      w.style.zoom = ratio;
      const scroll = w.parentElement,
        id = commands?.state.selected,
        focus = id + "@" + scroll.clientWidth;
      if (
        scroll.scrollWidth > scroll.clientWidth + 8 &&
        scroll.dataset.center !== focus
      ) {
        const hit = actors.get(id)?.hit;
        if (hit) {
          scroll.scrollLeft = Math.max(
            0,
            Number(hit.dataset.wireX) * ratio - scroll.clientWidth / 2,
          );
          if (scroll.clientWidth < 500 && !scroll.dataset.center)
            scroll.scrollTop = 90;
          scroll.dataset.center = focus;
        }
      }
    }
  }
  function actor(id, host) {
    const node = document.createElement("div");
    node.className = "robot-pod";
    node.innerHTML =
      '<button class="robot-bubble" type="button"><span></span><b></b><small></small></button><button class="station robot-hit" type="button"></button><span class="robot-name"></span>';
    host.append(node);
    const [bubble, hit, name] = node.children;
    bubble.dataset.signal = id;
    hit.dataset.selectAgent = id;
    visibility?.observe(hit);
    return { node, bubble, hit, name, move: null, signature: null };
  }
  function update(el, s, status, action) {
    if (!el) return;
    if (current !== el) mount(el);
    commands = { state: s, status, action };
    el.dataset.zoom = s.ui.zoom;
    const sp = WorkshopSpatial,
      now = Date.now(),
      active = s.agents.filter((a) => a.lifecycle === "active"),
      world = el.querySelector(".hq-world"),
      deskZones = s.space.zones.filter((z) => z.type === "workstation"),
      count = Math.max(6, ...deskZones.map((z) => z.index + 1)),
      h = Math.max(800, 800 + (Math.ceil(count / 3) - 2) * 205);
    world.style.height = h + "px";
    el.querySelector(".hq-floor-extension").style.height =
      Math.max(0, h - 700) + "px";
    fit();
    const zoneHost = el.querySelector(".spatial-zones");
    for (const z of s.space.zones.filter((z) => !z.agentId)) {
      let btn = zoneHost.querySelector(".zone-" + z.id);
      if (!btn) {
        btn = document.createElement("button");
        btn.className = "zone-beacon zone-" + z.id;
        btn.dataset.zone = z.id;
        btn.innerHTML = "<span></span><b></b><small></small>";
        zoneHost.append(btn);
        btn.style.left = z.position.x + "px";
        btn.style.top = z.position.y + "px";
        text(
          btn.children[0],
          {
            lounge: "◡",
            briefing: "◇",
            library: "▥",
            operations: "⌘",
            archive: "▱",
          }[z.id],
        );
        text(btn.children[1], z.name);
      }
      text(btn.children[2], z.occupancy.length + " / " + z.seats.length);
    }
    const host = el.querySelector(".hq-stations");
    for (let i = 0; i < count; i++) {
      const zone = deskZones.find((z) => z.index === i),
        a = active.find((a) => a.id === zone?.agentId),
        p = sp.slot(i);
      let desk = desks.get(i);
      if (!desk) {
        desk = document.createElement("button");
        desk.innerHTML =
          '<span class="operator-chair"></span>' +
          WorkshopHeadquarters.desk(i) +
          '<span class="station-name"></span><span class="station-role"></span><span class="station-status"></span>';
        host.append(desk);
        desks.set(i, desk);
      }
      desk.style.cssText =
        "left:" +
        p.x +
        "px;top:" +
        p.y +
        "px;--depth:" +
        p.scale +
        ";--agent:" +
        (a?.color || "#797281");
      const l = a && s.space.locations[a.id],
        at = l?.zoneId === zone?.id && !l?.move;
      desk.className = a
        ? "assigned-desk hq-station " + (at ? status(a.id) : "away")
        : "vacant-station";
      desk.dataset.wireX = p.x;
      desk.dataset.wireY = p.y - 105;
      if (a) {
        desk.dataset.selectAgent = a.id;
        delete desk.dataset.action;
      } else {
        delete desk.dataset.selectAgent;
        desk.dataset.action = "new-agent";
      }
      desk.setAttribute(
        "aria-label",
        a ? "Select " + a.name : "Create an agent",
      );
      text(
        desk.querySelector(".station-name"),
        a ? a.symbol + " " + a.name : "＋ Available station",
      );
      text(desk.querySelector(".station-role"), a ? a.role : "");
      text(
        desk.querySelector(".station-status"),
        a ? (at ? status(a.id) : "away") : "",
      );
    }
    for (const [i, d] of desks)
      if (i >= count) {
        d.remove();
        desks.delete(i);
      }
    for (const [id, entry] of actors)
      if (!active.some((a) => a.id === id)) {
        visibility?.unobserve(entry.hit);
        entry.node.remove();
        entry.trail?.remove();
        actors.delete(id);
      }
    let working = 0,
      attention = 0;
    for (const [n, a] of active.entries()) {
      let entry = actors.get(a.id);
      if (!entry) {
        entry = actor(a.id, el.querySelector(".floor-actors"));
        actors.set(a.id, entry);
      }
      const { node, bubble, hit, name } = entry,
        l = s.space.locations[a.id],
        info = activity(s, a, status(a.id), now),
        m = l.move,
        isDesk = l.zoneId === sp.workId(a.id) && !m;
      entry.info = info;
      node.dataset.pose = info.pose;
      node.dataset.signal = info.kind;
      node.dataset.selected = a.id === s.selected;
      node.dataset.desk = isDesk;
      node.style.setProperty("--agent", a.color);
      node.style.setProperty("--phase", -n * 1.73 + "s");
      working += info.pose === "working";
      attention += info.kind === "attention";
      hit.className =
        "station robot-hit " +
        status(a.id) +
        (m ? " walking" : info.pose === "resting" ? " seated" : "") +
        (isDesk ? "" : " spatial-agent");
      hit.dataset.agentName = a.name;
      hit.dataset.spatialAgent = a.id;
      hit.setAttribute("aria-label", "Select " + a.name + ", " + info.label);
      hit.setAttribute("aria-pressed", a.id === s.selected);
      const signature = [
        a.avatar,
        a.accessory,
        a.color,
        a.eyeStyle,
        a.bodyShape,
        a.trim,
        a.symbol,
      ].join("|");
      if (entry.signature !== signature) {
        hit.innerHTML = WorkshopRobot.svg(a);
        entry.signature = signature;
      }
      const p = spot(s, l.zoneId, l.position);
      if (m && entry.move !== m.id) {
        const pts = m.points.map((p, i) =>
          i === 0
            ? spot(s, m.fromZoneId, p)
            : i === m.points.length - 1
              ? spot(s, m.toZoneId, p)
              : p,
        );
        const d = pts
          .map((p, i) => (i ? "L" : "M") + p.x + " " + p.y)
          .join(" ");
        node.style.left = "0";
        node.style.top = "0";
        node.style.offsetPath = 'path("' + d + '")';
        node.style.animation =
          "floor-travel " +
          m.duration +
          "ms linear " +
          -Math.max(0, now - m.startedAt) +
          "ms both";
        entry.move = m.id;
        entry.trail = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        entry.trail.setAttribute("d", d);
        entry.trail.setAttribute("stroke", a.color);
        el.querySelector(".floor-paths").append(entry.trail);
      } else if (!m) {
        entry.trail?.remove();
        entry.trail = null;
        entry.move = null;
        node.style.offsetPath = "none";
        node.style.animation = "none";
        node.style.left = p.x + "px";
        node.style.top = p.y + "px";
      }
      const pos = m ? sp.position(s, a.id) : p;
      hit.dataset.wireX = pos.x;
      hit.dataset.wireY = pos.y - 40;
      text(name, a.name);
      bubble.dataset.kind = info.kind;
      const compact =
        !isDesk &&
        !m &&
        a.id !== s.selected &&
        sp.occupants(s, l.zoneId).length > 1;
      node.dataset.compact = compact;
      text(bubble.children[0], types[info.kind]);
      text(bubble.children[1], info.label);
      text(
        bubble.children[2],
        info.run &&
          ["working", "using-tool", "queued", "waiting", "paused"].includes(
            info.run.status,
          )
          ? info.run.task
          : "",
      );
      bubble.title = a.name + ": " + info.detail;
      bubble.setAttribute(
        "aria-label",
        "Inspect " + a.name + " · " + info.label,
      );
    }
    text(
      el.querySelector(".floor-count"),
      active.length +
        " present   /   " +
        working +
        " working   /   " +
        attention +
        " need attention",
    );
    const a = s.agents.find((a) => a.id === s.selected),
      entry = actors.get(s.selected);
    selection = entry?.info || null;
    text(
      el.querySelector(".signal-title"),
      a.name + "   /   " + (selection?.label || a.lifecycle),
    );
    text(
      el.querySelector(".signal-detail"),
      selection?.detail || "This operator is outside the headquarters.",
    );
    const move = el.querySelector('[data-floor="move"]'),
      loc = s.space.locations[a.id];
    text(
      move,
      loc?.zoneId === sp.workId(a.id)
        ? "Move to lounge"
        : "Return to workstation",
    );
    move.disabled =
      !entry ||
      !!loc?.move ||
      ["working", "using-tool", "paused"].includes(status(a.id));
    const inspect = el.querySelector('[data-floor="inspect"]');
    text(
      inspect,
      selection?.handoff
        ? "Inspect message ↗"
        : selection?.run?.status === "waiting"
          ? "Review approval ↗"
          : selection?.run
            ? "Inspect task ↗"
            : "Activity history ↗",
    );
    el.querySelector('[data-floor="task"]').disabled = !entry;
    el.querySelector('[data-floor="sample"]').disabled = !entry;
    const recentEvents = [
      ...s.space.events.filter((e) => e.agentId === a.id).slice(-6),
      ...s.runs
        .filter((r) => r.agentId === a.id)
        .slice(0, 6)
        .flatMap((r) => r.events.slice(-6)),
    ]
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
      .slice(0, 6);
    const history = el.querySelector(".floor-history ol"),
      key = a.id + ":" + recentEvents.map((e) => e.id).join(",");
    if (history.dataset.key !== key) {
      history.dataset.key = key;
      history.innerHTML =
        recentEvents
          .map(
            (e) =>
              "<li><time>" +
              safe(new Date(e.at).toLocaleTimeString()) +
              "</time> " +
              safe(e.label) +
              "</li>",
          )
          .join("") || "<li>No events recorded for this operator yet.</li>";
    }
    const recent = s.handoffs.filter((h) => now - Date.parse(h.at) < until);
    for (const [id, link] of routes)
      if (!recent.some((h) => h.id === id)) {
        link.remove();
        routes.delete(id);
      }
    for (const h of recent) {
      if (routes.has(h.id)) continue;
      const f = actors.get(h.senderId),
        t = actors.get(h.recipientId);
      if (!f || !t) continue;
      const x = +f.hit.dataset.wireX,
        y = +f.hit.dataset.wireY,
        x2 = +t.hit.dataset.wireX,
        y2 = +t.hit.dataset.wireY,
        d =
          "M" +
          x +
          " " +
          y +
          " Q" +
          (x + x2) / 2 +
          " " +
          (Math.min(y, y2) - 90) +
          " " +
          x2 +
          " " +
          y2;
      const link = document.createElement("div");
      link.className = "message-route floor-route";
      link.innerHTML = `<svg width="100%" height="100%" aria-hidden="true"><path d="${d}" fill="none" stroke="#f2a0e5" stroke-width="2" stroke-dasharray="5 6"/><circle class="floor-packet" r="6" fill="#ffe0f8" style="offset-path:path('${d}');animation-delay:-${now - Date.parse(h.at)}ms"/><circle class="delivery-ring" cx="${x2}" cy="${y2}" r="14"/></svg><button style="left:${(x + x2) / 2}px;top:${Math.min(y, y2) - 40}px" data-packet="${safe(h.id)}">Inspect delivery ↗</button>`;
      el.querySelector(".floor-links").append(link);
      routes.set(h.id, link);
    }
    fit();
    clearTimeout(expiry);
    if (recent.length)
      expiry = setTimeout(
        () => {
          if (el.isConnected) update(el, s, status, action);
        },
        Math.max(10, until - (now - Date.parse(recent[0].at)) + 10),
      );
  }
  return { shell, shellUpdate, update, activity, release };
})();
