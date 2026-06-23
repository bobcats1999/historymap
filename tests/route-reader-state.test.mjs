import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /id="routeReader"/, "page should include a route reader panel");
assert.match(html, /故事导览面板/, "route reader container should now be presented as a story guide");
assert.match(script, /let learningMode = false;/, "story guide should keep compatibility with learning mode state");
assert.match(script, /let activeRouteStep = 0;/, "route reader should track the active route step");
assert.match(script, /const progressStorageKey = "westernHistoryProgress";/, "progress should use a stable localStorage key");

for (const fn of [
  "startRoute",
  "exitRouteReader",
  "continueStoryGuide",
  "goToRouteStep",
  "nextRouteStep",
  "previousRouteStep",
  "renderRouteReader",
  "toggleStoryAutoplay",
  "saveProgress",
  "loadProgress"
]) {
  assert.match(script, new RegExp(`function ${fn}\\(`), `script should define ${fn}()`);
}

assert.match(script, /completedEventIds = new Set/, "progress should use a completedEventIds Set");
assert.match(script, /focusStoryScene\(eventId/, "route stepping should focus the current story event on the map");
assert.match(script, /storySceneForEvent/, "route reader should render story scenes instead of course checks");
assert.match(script, /window\.clearTimeout\(overviewAutoTimer\);/, "starting a route should cancel pending overview auto-zoom");
assert.match(script, /introAutoPending = false;/, "starting a route should clear pending intro auto-zoom state");
