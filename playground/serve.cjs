const http = require("node:http"),
  { makeHTML } = require("./build.cjs");
const port = Number(process.env.PORT || 8787);
http
  .createServer(async (req, res) => {
    if (req.url !== "/") {
      res.writeHead(404).end("Not found");
      return;
    }
    try {
      const html = await makeHTML();
      res
        .writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        })
        .end(html);
    } catch (e) {
      console.error(e);
      res
        .writeHead(500)
        .end("The prototype could not build. See the development terminal.");
    }
  })
  .on("error", (e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .listen(port, "127.0.0.1", () =>
    console.log("Moss Animation Playground: http://127.0.0.1:" + port),
  );
