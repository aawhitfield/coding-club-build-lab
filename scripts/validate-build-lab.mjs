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
