#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const requiredMeetings = [
  "01-ridiculous-website",
  "02-branching-story",
  "03-events-and-endings",
  "04-sprig-remix",
  "05-microgame",
  "06-school-problem",
  "07-working-feature",
  "08-showcase"
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else yieldFile(target);
  }
}

const files = [];
function yieldFile(file) { files.push(file); }
walk(root);

function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }

for (const file of files.filter((candidate) => candidate.endsWith(".js") || candidate.endsWith(".mjs"))) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (error) {
    errors.push(`JavaScript syntax: ${path.relative(root, file)}\n${error.stderr?.toString() || error.message}`);
  }
}

for (const file of files.filter((candidate) => candidate.endsWith(".html"))) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const target = match[1];
    if (/^(https?:|data:|#|mailto:|javascript:)/.test(target)) continue;
    const localTarget = path.resolve(path.dirname(file), target.split("#")[0].split("?")[0]);
    if (!fs.existsSync(localTarget)) errors.push(`HTML reference: ${path.relative(root, file)} -> ${target}`);
  }
}

const launcher = read("index.html");
if (!fs.existsSync(path.join(root, "ACCOUNT-PIT-STOP.html"))) {
  errors.push("Missing rendered Day Zero guide: ACCOUNT-PIT-STOP.html");
}
if (launcher.includes("ACCOUNT-PIT-STOP.md") || /meetings\/[^\"]+\/START-HERE\.md/.test(launcher)) {
  errors.push("Launcher still sends students directly to raw Markdown");
}
if (!launcher.includes("meetings/01-ridiculous-website/mission.html")) {
  errors.push("Launcher does not link to the Meeting 1 Mission Control page");
}

const missionFile = "meetings/01-ridiculous-website/mission.html";
const missionSource = read(missionFile);
const missionConfigMatch = missionSource.match(/<script id="mission-config" type="application\/json">([\s\S]*?)<\/script>/);
if (!missionConfigMatch) {
  errors.push(`${missionFile} is missing its JSON mission configuration`);
} else {
  try {
    const config = JSON.parse(missionConfigMatch[1]);
    if (config.id !== "01-ridiculous-website" || config.mode !== "embedded") {
      errors.push(`${missionFile} has an unexpected mission id or mode`);
    }
    for (const trackName of ["project", "catchUp"]) {
      const track = config.tracks?.[trackName];
      if (!track?.preview || !track?.watchPath || !Array.isArray(track.editFiles)) {
        errors.push(`${missionFile} is missing the ${trackName} track configuration`);
        continue;
      }
      for (const target of [track.preview, ...track.editFiles]) {
        const targetPath = path.resolve(path.dirname(path.join(root, missionFile)), target);
        if (!targetPath.startsWith(root + path.sep) || !fs.existsSync(targetPath)) {
          errors.push(`${missionFile} points to a missing or unsafe target: ${target}`);
        }
      }
      const watchPath = path.resolve(path.dirname(path.join(root, missionFile)), track.watchPath);
      if (!watchPath.startsWith(root + path.sep) || !fs.existsSync(watchPath)) {
        errors.push(`${missionFile} has a missing or unsafe watch path: ${track.watchPath}`);
      }
    }
  } catch (error) {
    errors.push(`${missionFile} contains invalid mission JSON: ${error.message}`);
  }
}

for (const track of ["project", "catch-up"]) {
  const html = read(`meetings/01-ridiculous-website/${track}/index.html`);
  const css = read(`meetings/01-ridiculous-website/${track}/style.css`);
  const js = read(`meetings/01-ridiculous-website/${track}/script.js`);
  for (const marker of ["BUILD LAB EDIT 1", "BUILD LAB EDIT 2", "BUILD LAB EDIT 3"]) {
    if (!html.includes(marker) && !css.includes(marker)) errors.push(`${track} is missing ${marker}`);
  }
  if (!js.includes("BUILD LAB EDIT 5")) errors.push(`${track}/script.js is missing the optional edit marker`);
}

const devcontainer = read(".devcontainer/devcontainer.json");
if (!devcontainer.includes('"postCreateCommand": "node .devcontainer/start-preview.mjs"') || !devcontainer.includes('"postStartCommand": "node .devcontainer/start-preview.mjs"')) {
  errors.push("Codespace lifecycle does not use the idempotent preview starter");
}
if (!fs.existsSync(path.join(root, ".devcontainer", "start-preview.mjs"))) {
  errors.push("Missing idempotent preview starter: .devcontainer/start-preview.mjs");
}

// Sprig accepts rectangular bitmap templates and renders each sprite into a
// 16x16 tile. Catch malformed starter art here instead of discovering it in
// the live editor during a club meeting.
for (const file of files.filter((candidate) => candidate.endsWith(".js") && /meetings[\\/]0[45]-/.test(candidate))) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/bitmap`([\\s\\S]*?)`/g)) {
    const rows = match[1].trim().split(/\\r?\\n/).map((row) => row.trim());
    const width = rows[0]?.length || 0;
    if (!width || rows.some((row) => row.length !== width)) {
      errors.push(`Sprig bitmap is not rectangular: ${path.relative(root, file)}`);
    }
    if (width > 16 || rows.length > 16) {
      errors.push(`Sprig bitmap exceeds the 16x16 tile: ${path.relative(root, file)}`);
    }
  }
}

for (const meeting of requiredMeetings) {
  const directory = path.join(root, "meetings", meeting);
  if (!fs.existsSync(directory)) {
    errors.push(`Missing meeting directory: ${meeting}`);
    continue;
  }
  for (const required of ["START-HERE.md", "TEAM-LOG.md", "AI-LOG.md", "DEMO.md"]) {
    if (!fs.existsSync(path.join(directory, required))) errors.push(`${meeting} missing ${required}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Coding Club Build Lab validation passed (${files.length} files).`);
