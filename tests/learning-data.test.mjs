import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");

const westernMainMatch = script.match(/westernMain:\s*{[\s\S]*?eventIds:\s*\[([^\]]+)\]/);
assert.ok(westernMainMatch, "westernMain route should define eventIds");

const westernMainIds = Array.from(westernMainMatch[1].matchAll(/"([^"]+)"/g), (match) => match[1]);
assert.ok(westernMainIds.length >= 42, "westernMain should use an expanded story route");

assert.match(script, /const learningContent = {/, "script should define structured learning content");
assert.match(script, /function getEventLearning\(/, "event details should read through getEventLearning");
assert.match(script, /function learningEntry\(/, "learning content should use a consistent entry helper");

for (const id of ["mesopotamia", "hebrew", "athens", "romanRepublic", "augustus", "jesus", "constantine", "westFall"]) {
  assert.match(script, new RegExp(`${id}:\\s*learningEntry\\(`), `core event '${id}' should keep a learningEntry`);
}

assert.match(script, /sources:\s*\[/, "learning entries should include source lists");
assert.match(script, /quiz:\s*{/, "learning entries should include a quiz");
assert.match(script, /answer:/, "quiz entries should define an answer");
