/* One shared robot design language; only the scene animates its articulated parts. */
window.WorkshopRobot = (() => {
  const choices = {
    eyeStyle: ["pixels", "round", "bars"],
    bodyShape: ["capsule", "box", "taper"],
    trim: ["plain", "utility stripe", "chest plate"],
  };
  function normalize(a) {
    return Object.fromEntries(
      Object.entries(choices).map(([key, values]) => [
        key,
        values.includes(a[key])
          ? a[key]
          : values[a.avatar === "cat" ? 2 : a.avatar === "square" ? 1 : 0],
      ]),
    );
  }
  function fields(a) {
    const options = normalize(a);
    return Object.entries(choices)
      .map(
        ([key, values]) =>
          `<label class="field">${{ eyeStyle: "Display eyes", bodyShape: "Chassis", trim: "Decoration" }[key]}<select name="${key}">${values.map((v) => `<option ${v === options[key] ? "selected" : ""}>${v}</option>`).join("")}</select></label>`,
      )
      .join("");
  }
  function svg(a) {
    const { eyeStyle, bodyShape, trim } = normalize(a),
      color = /^#[0-9a-f]{6}$/i.test(a.color) ? a.color : "#62b3a4";
    const head = a.avatar === "square" ? 7 : 17,
      body =
        bodyShape === "box"
          ? "M32 61h36v25H32z"
          : bodyShape === "taper"
            ? "M30 62q20-8 40 0l-6 23H36z"
            : "M31 64q0-8 19-8t19 8v12q0 12-19 12T31 76z";
    const eye = (x) =>
      eyeStyle === "round"
        ? `<circle cx="${x}" cy="41" r="4.5"/><circle cx="${x + 1}" cy="41" r="1.8" fill="#132b32"/>`
        : `<rect x="${x - 4}" y="${eyeStyle === "bars" ? 39 : 36}" width="8" height="${eyeStyle === "bars" ? 4 : 10}" rx="${eyeStyle === "bars" ? 2 : 3}"/>`;
    const accessory =
      {
        sprout:
          '<path d="M48 20Q47 11 50 9" stroke="#84caa5" fill="none" stroke-width="3"/><path d="M49 13Q34 13 33 2Q47 0 49 13M50 10Q52 0 65 1Q63 12 50 10" fill="#90e3ae"/>',
        antenna:
          '<path d="m51 20 5-12" stroke="#b2bdc4" stroke-width="3"/><circle cx="57" cy="6" r="4.5" fill="#ffd686"/>',
        star: '<path d="m52 0 3 7 8 1-6 6 1 7-7-4-7 3 2-8-5-5 8-1Z" fill="#ffcf86"/>',
      }[a.accessory] || "";
    const leg = (x, c) =>
      `<g class="rb-leg ${c}"><path d="M${x} 81v9" stroke="#819093" stroke-width="7"/><rect x="${x - 7}" y="88" width="15" height="7" rx="3" fill="#3b4853" stroke="#9ba7a9"/></g>`;
    const arm = (x, sign, c) =>
      `<g class="rb-arm ${c}"><circle cx="${x}" cy="65" r="5" fill="#56606a"/><path d="m${x} 65 ${sign * 5} 9" stroke="#c5c2b7" stroke-width="7" stroke-linecap="round"/><rect x="${x + sign * 5 - 4}" y="72" width="9" height="7" rx="3" fill="${color}" stroke="#28333b"/></g>`;
    return `<svg class="bot neon-avatar floor-robot" viewBox="0 0 100 100" aria-hidden="true"><g class="rb-shell">${leg(39, "left")}${leg(60, "right")}<path d="${body}" fill="#d7d4c8" stroke="#46505c" stroke-width="2"/><path d="M36 79q14 5 27 0" fill="none" stroke="#969c99" stroke-width="2"/>${trim === "plain" ? "" : `<path d="${trim === "chest plate" ? "M36 63h27l-4 13H41Z" : "M34 67h32v4H34Z"}" fill="${color}" opacity=".8"/>`}<circle cx="50" cy="71" r="6" fill="#36414c"/><text x="50" y="74" fill="#e8ece4" text-anchor="middle" font-size="9">${["✿", "◆", "★", "☀", "☾", "✦", "♥"].includes(a.symbol) ? a.symbol : "✿"}</text>${arm(31, -1, "left")}${arm(69, 1, "right")}<g class="rb-head">${accessory}${a.avatar === "cat" ? `<path d="m22 28-3-19 20 12m23 0 18-12-2 19" fill="${color}" stroke="#44505a" stroke-width="2"/>` : ""}<rect x="18" y="17" width="64" height="45" rx="${head}" fill="${color}" stroke="#334452" stroke-width="2.5"/><path d="M29 22q20-5 40 0" fill="none" stroke="#fff" opacity=".4" stroke-width="2"/><rect x="23" y="28" width="54" height="27" rx="${head * 0.65}" fill="#11232e" stroke="#90a9a4"/><g class="rb-gaze"><g class="rb-eyes" fill="#c0ffe7">${eye(37)}${eye(62)}</g></g><path class="rb-mouth" d="M46 48q4 4 9 0" stroke="#97c6ba" fill="none" stroke-width="2"/><circle cx="77" cy="55" r="2" fill="#f6de9f"/></g></g></svg>`;
  }
  return { svg, normalize, fields };
})();
