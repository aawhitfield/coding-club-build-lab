import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const port = Number(process.env.PORT || 8000);
const directory = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(directory, "serve.mjs");
const logPath = "/tmp/coding-club-preview.log";

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isRunning() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

if (await isRunning()) {
  console.log(`Coding Club preview already running at http://127.0.0.1:${port}`);
  process.exit(0);
}

const logFile = fs.openSync(logPath, "a");
const child = spawn(process.execPath, [serverPath], {
  detached: true,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", logFile, logFile]
});
child.unref();

for (let attempt = 0; attempt < 24; attempt += 1) {
  if (await isRunning()) {
    console.log(`Coding Club preview available at http://127.0.0.1:${port}`);
    console.log(`Preview log: ${logPath}`);
    process.exit(0);
  }
  await wait(250);
}

console.error(`Coding Club preview did not start. Check ${logPath}.`);
process.exit(1);
