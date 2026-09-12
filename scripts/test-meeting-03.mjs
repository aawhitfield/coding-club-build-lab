#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const track of ["project", "catch-up"]) {
  const source = fs.readFileSync(path.join(root, "meetings", "03-events-and-endings", track, "script.js"), "utf8");
  const handlers = {};
  const text = {};
  const visibility = {};
  const picked = [];
  const context = {
    onClick: (id, action) => { handlers[id] = action; },
    pickRandom: (items) => { picked.push(items); return items[0]; },
    setText: (id, value) => { text[id] = String(value); },
    show: (id) => { visibility[id] = true; },
    hide: (id) => { visibility[id] = false; }
  };
  vm.runInNewContext(source, context, { filename: `${track}/script.js` });

  assert.equal(typeof handlers["chaos-button"], "function", `${track} did not register the Chaos Button`);
  assert.equal(typeof handlers["reset-button"], "function", `${track} did not register Reset`);
  assert.ok(context.actions.length >= 5, `${track} needs at least five actions`);
  assert.ok(context.complications.length >= 5, `${track} needs at least five complications`);

  handlers["chaos-button"]();
  assert.equal(picked.length, 2, `${track} should pick from both lists`);
  assert.equal(text["action-result"], context.actions[0], `${track} action output did not come from actions`);
  assert.equal(text["complication-result"], context.complications[0], `${track} complication output did not come from complications`);
  assert.equal(visibility["result-card"], true, `${track} did not show the result card`);

  handlers["reset-button"]();
  assert.equal(visibility["result-card"], false, `${track} reset did not hide the result card`);
  assert.match(text["action-result"], /appear here/i, `${track} reset did not restore action placeholder`);
}

const clubKit = fs.readFileSync(path.join(root, "shared", "club-kit.js"), "utf8");
const warnings = [];
const missingContext = {
  window: {},
  document: { getElementById: () => null },
  console: { warn: (message) => warnings.push(message) }
};
vm.runInNewContext(clubKit, missingContext, { filename: "shared/club-kit.js" });
missingContext.window.onClick("missing-id", () => {});
assert.ok(warnings.some((message) => message.includes("missing-id")), "club-kit did not identify a missing ID");

console.log("Meeting 3 behavior tests passed (project, catch-up, and missing-ID warning).");
