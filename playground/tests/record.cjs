const { open } = require("./preview.cjs"),
  fs = require("node:fs"),
  path = require("node:path");
(async () => {
  const { browser, page } = await open();
  try {
    await page.selectOption("#camera", "character");
    const data = await page.evaluate(async () => {
      mossPlayground.reset();
      mossPlayground.pause();
      const source = document.getElementById("scene"),
        out = document.createElement("canvas");
      out.width = 960;
      out.height = 570;
      const ctx = out.getContext("2d");
      const stream = out.captureStream(0),
        track = stream.getVideoTracks()[0],
        chunks = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 2500000,
      });
      recorder.ondataavailable = (e) => chunks.push(e.data);
      const done = new Promise((resolve) => (recorder.onstop = resolve));
      recorder.start();
      for (let f = 0; f < 42 * 24; f++) {
        if (f === 24) document.getElementById("demo").click();
        mossPlayground.advance(1 / 24);
        ctx.fillStyle = "#111015";
        ctx.fillRect(0, 0, 960, 570);
        ctx.drawImage(source, 0, 0, 960, 510);
        ctx.fillStyle = "#a1dbc7";
        ctx.font = "18px sans-serif";
        ctx.fillText(
          "MOSS / 0.1.0  ·  " + document.getElementById("state").textContent,
          24,
          546,
        );
        track.requestFrame();
        await new Promise((r) => setTimeout(r, 1000 / 24));
      }
      recorder.stop();
      await done;
      track.stop();
      return {
        data: Array.from(
          new Uint8Array(
            await new Blob(chunks, { type: "video/webm" }).arrayBuffer(),
          ),
        ),
        state: mossPlayground.snapshot().state,
      };
    });
    fs.writeFileSync(
      path.join(__dirname, "../evidence/full-sequence.webm"),
      Buffer.from(data.data),
    );
    console.log({ recordedBytes: data.data.length, finalState: data.state });
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
