#!/usr/bin/env node
import { once } from "node:events";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 8128;
const serverPath = path.join(root, ".devcontainer", "serve.mjs");
const child = spawn(process.execPath, [serverPath], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
child.stdout.on("data", (chunk) => { output += chunk.toString(); });
child.stderr.on("data", (chunk) => { output += chunk.toString(); });

async function get(route) {
  return fetch(`http://127.0.0.1:${port}${route}`);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await get("/__health");
      if (response.ok) return;
    } catch {
      // The child is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Preview server did not start.\n${output}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await waitForServer();

  const health = await get("/__health");
  const healthBody = await health.json();
  assert(healthBody.ok === true, "GET /__health did not report ok=true");

  const version = await get("/__version?path=meetings%2F01-ridiculous-website%2Fproject");
  const versionBody = await version.json();
  assert(version.ok && versionBody.ok && Number.isFinite(versionBody.version), "GET /__version did not return a numeric version");

  const missionRoutes = [
    ["01-ridiculous-website", "The Ridiculous Website"],
    ["02-branching-story", "Choose Your Own Disaster"],
    ["03-events-and-endings", "Trigger the Secret Ending"],
    ["04-sprig-remix", "Remix the Rules"],
    ["05-microgame", "Build a 30-Second Obsession"],
    ["06-school-problem", "Fix One School Annoyance"],
    ["07-working-feature", "Make It Work"],
    ["08-showcase", "Broadcast What You Built"]
  ];
  for (const [meeting, heading] of missionRoutes) {
    const mission = await get(`/meetings/${meeting}/mission.html`);
    const missionText = await mission.text();
    assert(mission.ok && missionText.includes(heading), `Mission Control page did not load: ${meeting}`);
    assert(missionText.includes('id="mission-config"'), `Mission configuration missing: ${meeting}`);
    assert(missionText.includes("data-progress"), `Mission progress controls missing: ${meeting}`);
  }

  const missing = await get("/does-not-exist.html");
  assert(missing.status === 404, "Missing static file did not return 404");

  const missingVersion = await get("/__version?path=not-a-real-folder");
  assert(missingVersion.status === 404, "Missing version path did not return 404");

  const traversal = await get("/__version?path=..%2F..%2Fetc%2Fpasswd");
  assert(traversal.status === 400, "Traversal path was not rejected with 400");

  const malformed = await get("/__version?path=%E0%A4%A");
  assert(malformed.status === 400, "Malformed encoded path was not rejected with 400");

  console.log("Preview server tests passed (health, version, mission, missing file, and traversal).");
} finally {
  child.kill("SIGTERM");
  await once(child, "exit").catch(() => {});
}
