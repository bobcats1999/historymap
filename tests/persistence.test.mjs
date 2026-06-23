import assert from "node:assert/strict";
import {
  createInitialProgress,
  restoreProgress,
  serializeProgress
} from "../state-machine.mjs";

const empty = createInitialProgress();
assert.deepEqual(empty.completedEventIds, []);
assert.deepEqual(empty.completedQuizIds, []);

const progress = restoreProgress({
  completedEventIds: ["hebrew", "athens"],
  completedQuizIds: ["hebrew"],
  lastRouteId: "westernMain",
  lastRouteStep: 2
});
assert.deepEqual(progress.completedEventIds, ["hebrew", "athens"]);
assert.deepEqual(progress.completedQuizIds, ["hebrew"]);
assert.equal(progress.lastRouteId, "westernMain");
assert.equal(progress.lastRouteStep, 2);

const malformed = restoreProgress(null);
assert.deepEqual(malformed, empty);

const json = serializeProgress(progress);
assert.equal(JSON.parse(json).lastRouteStep, 2);
