import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 8000;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const requested = path.resolve(root, `.${decoded === "/" ? "/index.html" : decoded}`);
  return requested === root || requested.startsWith(`${root}${path.sep}`) ? requested : null;
}

const server = http.createServer((request, response) => {
  const filePath = safePath(request.url || "/");
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const target = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(target, (readError, data) => {
      if (readError) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, { "Content-Type": mime[path.extname(target).toLowerCase()] || "application/octet-stream" });
      response.end(data);
    });
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Coding Club preview available on port ${port}`);
});
