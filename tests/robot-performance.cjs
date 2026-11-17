/* Isolated synthetic benchmark, same local Chrome, viewport, route and data for both versions. */
const { chromium } = require("../playground/node_modules/playwright"),
  fs = require("node:fs"),
  path = require("node:path"),
  { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, ".."),
  options = { cwd: root, maxBuffer: 20 * 1024 * 1024, encoding: "utf8" };
const versions = {
  previous: execFileSync("git", ["show", "9e9069b:docs/index.html"], options),
  robots: fs.readFileSync(path.join(root, "docs/index.html"), "utf8"),
};
const size = (html) =>
  Buffer.byteLength(
    Array.from(
      html.matchAll(/<script>([\s\S]*?)<\/script>/g),
      (m) => m[1],
    ).join(""),
  );
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const results = [];
  try {
    for (const [version, html] of Object.entries(versions))
      for (const count of [3, 12]) {
        const page = await b.newPage({
          viewport: { width: 1440, height: 960 },
        });
        await page.route("**/*", (r) => r.abort());
        await page.route("https://bench.test/", (r) =>
          r.fulfill({ body: html, contentType: "text/html" }),
        );
        await page.addInitScript((n) => {
          const agents = Array.from({ length: n }, (_, i) => ({
            id: "fixture-" + i,
            name: "Operator " + i,
            role: "Test operator",
            instructions: "Use bullets.",
            document: "Sample text. Review the document.",
            tool: true,
            format: "concise",
            version: 1,
            avatar: ["round", "square", "cat"][i % 3],
          }));
          localStorage.setItem(
            "ai-agent-workshop.v1",
            JSON.stringify({
              agents,
              selected: agents[0].id,
              runs: [],
              messages: [],
              ui: { view: "workshop", zoom: 1 },
              settings: {},
              tutorial: { schema: 2, step: 0, active: false },
            }),
          );
        }, count);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Performance.enable");
        await page.goto("https://bench.test/");
        await page.waitForTimeout(300);
        async function sample() {
          const metrics = async () =>
            Object.fromEntries(
              (await cdp.send("Performance.getMetrics")).metrics.map((x) => [
                x.name,
                x.value,
              ]),
            );
          const a = await metrics();
          const frames = await page.evaluate(
            () =>
              new Promise((resolve) => {
                const intervals = [];
                let first = 0,
                  prev = 0;
                function frame(t) {
                  if (prev) intervals.push(t - prev);
                  else first = t;
                  prev = t;
                  if (t - first < 2000) requestAnimationFrame(frame);
                  else resolve(intervals.sort((a, b) => a - b));
                }
                requestAnimationFrame(frame);
              }),
          );
          const z = await metrics();
          return {
            p95FrameMs: +frames[Math.floor(frames.length * 0.95)].toFixed(1),
            frames: frames.length,
            mainThreadMs: +((z.TaskDuration - a.TaskDuration) * 1000).toFixed(
              1,
            ),
            usedJSHeapMiB: +(z.JSHeapUsedSize / 1048576).toFixed(1),
          };
        }
        const idle = await sample();
        await page.evaluate(() => {
          for (let i = 0; i < 3; i++) {
            const el = document.getElementById("agent-select");
            el.value = "fixture-" + i;
            el.dispatchEvent(new Event("change"));
            document.getElementById("task-input").value = "Summarize document";
            document.getElementById("task-form").requestSubmit();
          }
        });
        const active = await sample();
        results.push({
          version,
          operators: count,
          concurrentRuns: 3,
          htmlBytes: Buffer.byteLength(html),
          scriptBytes: size(html),
          loadEventMs: await page.evaluate(() =>
            Math.round(
              performance.getEntriesByType("navigation")[0].loadEventEnd,
            ),
          ),
          idle,
          active,
        });
        await page.close();
      }
    const report = {
      browser: b.version(),
      scope:
        "One local headless Chrome sample per condition. Initial navigation from an intercepted in-memory response; excludes network and disk. Two seconds per idle/active sample. Main thread is CDP TaskDuration, not machine CPU percentage. GPU/power not measured.",
      results,
    };
    fs.writeFileSync(
      path.join(root, "review/robot-hq/performance.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(results));
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
