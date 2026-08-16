import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 8000);
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
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath || "/");
  } catch {
    return null;
  }
  const normalized = decoded.startsWith("/") ? decoded : `/${decoded}`;
  const requested = path.resolve(root, `.${normalized === "/" ? "/index.html" : normalized}`);
  return requested === root || requested.startsWith(`${root}${path.sep}`) ? requested : null;
}

function latestModified(filePath) {
  const stats = fs.statSync(filePath);
  if (!stats.isDirectory()) return stats.mtimeMs;
  return fs.readdirSync(filePath, { withFileTypes: true }).reduce((latest, entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return latest;
    return Math.max(latest, latestModified(path.join(filePath, entry.name)));
  }, stats.mtimeMs);
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(body);
}

function serveFile(request, response) {
  const filePath = safePath(request.url?.split("?")[0]);
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
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": mime[path.extname(target).toLowerCase()] || "application/octet-stream"
      });
      response.end(data);
    });
  });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", "http://127.0.0.1");

  if (requestUrl.pathname === "/__health") {
    sendJson(response, 200, { ok: true, port });
    return;
  }

  if (requestUrl.pathname === "/__version") {
    const relativePath = requestUrl.searchParams.get("path");
    const target = relativePath ? safePath(relativePath) : null;
    if (!target) {
      sendJson(response, 400, { ok: false, error: "A repository-relative path is required." });
      return;
    }
    try {
      sendJson(response, 200, {
        ok: true,
        path: relativePath,
        version: Math.floor(latestModified(target) * 1000)
      });
    } catch {
      sendJson(response, 404, { ok: false, error: "Path not found." });
    }
    return;
  }

  serveFile(request, response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Coding Club preview available at http://127.0.0.1:${port}`);
});
