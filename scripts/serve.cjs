const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "../app");
function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const route = new URL(request.url, "http://localhost").pathname;
      if (route === "/favicon.ico") {
        response.writeHead(204);
        response.end();
        return;
      }
      const name = route === "/" ? "index.html" : route.slice(1);
      if (!["index.html", "styles.css", "core.js", "app.js"].includes(name)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      const data = await fs.readFile(path.join(root, name));
      response.writeHead(200, {
        "Content-Type": name.endsWith(".html")
          ? "text/html; charset=utf-8"
          : name.endsWith(".css")
            ? "text/css; charset=utf-8"
            : "text/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(data);
    } catch {
      response.writeHead(500);
      response.end("Could not read application file.");
    }
  });
}
module.exports = { createServer };
if (require.main === module) {
  const server = createServer();
  server.listen(8841, "127.0.0.1", () =>
    process.stdout.write("NudgeSVG: http://127.0.0.1:8841\n"),
  );
}
