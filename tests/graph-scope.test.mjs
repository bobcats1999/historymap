import assert from "node:assert/strict";
import {
  createInitialUiState,
  startRouteReading,
  closeRouteReader,
  applyEntityFilter,
  deriveGraphScope
} from "../state-machine.mjs";

let state = createInitialUiState();
assert.deepEqual(deriveGraphScope(state), {
  routeId: "all",
  entityId: "all",
  relationId: "all",
  timeRange: null
});

state = startRouteReading(state, "westernMain", 0);
assert.equal(deriveGraphScope(state).routeId, "westernMain");

state = closeRouteReader(state, { keepRouteFilter: false });
assert.equal(deriveGraphScope(state).routeId, "all", "closing route reader should restore full graph scope");

state = startRouteReading(createInitialUiState(), "westernMain", 0);
state = closeRouteReader(state, { keepRouteFilter: true });
assert.equal(deriveGraphScope(state).routeId, "westernMain", "explicit route-only mode keeps route scope");

state = applyEntityFilter(createInitialUiState(), "france");
assert.equal(deriveGraphScope(state).entityId, "france");
