import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");

const expectedWesternMain = [
  "egypt", "mesopotamia", "hebrew", "persia", "athens", "alexander",
  "romanRepublic", "augustus", "jesus", "constantine", "nicaea",
  "division", "westFall", "justinian", "tours", "charlemagne", "verdun",
  "norman1066", "universities", "magnaCarta", "hundredYears", "blackDeath",
  "constantinople1453", "renaissance", "printing", "columbus", "reformation",
  "westphalia", "enlightenment", "frenchRevolution", "napoleon", "vienna",
  "industrial", "1848", "italyGermany", "imperialism", "ww1", "russianRev",
  "ww2", "unNatoEU", "coldWar", "decolonization", "1968", "1989",
  "maastricht", "911", "financial2008", "brexit", "covid", "ukraine2022",
  "swedenNato", "west2026"
];

const westernMainMatch = script.match(/westernMain:\s*{[\s\S]*?eventIds:\s*\[([^\]]+)\]/);
assert.ok(westernMainMatch, "westernMain route should define eventIds");
const actualWesternMain = Array.from(westernMainMatch[1].matchAll(/"([^"]+)"/g), (match) => match[1]);
assert.deepEqual(actualWesternMain, expectedWesternMain, "westernMain should use the expanded story sequence");

for (const id of expectedWesternMain) {
  assert.match(script, new RegExp(`event\\("${id}"`), `event '${id}' should exist`);
  assert.match(script, new RegExp(`eventId:\\s*"${id}"[\\s\\S]*?narrative:`), `story scene '${id}' should define narrative`);
  assert.match(script, new RegExp(`eventId:\\s*"${id}"[\\s\\S]*?bridgeToNext:`), `story scene '${id}' should define bridgeToNext`);
}

assert.match(script, /const storyScenes = {/, "script should define explicit story scenes");
assert.match(script, /westernMain:\s*\[/, "story scenes should cover westernMain");
