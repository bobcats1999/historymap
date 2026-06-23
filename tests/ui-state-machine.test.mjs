import assert from "node:assert/strict";
import {
  createInitialUiState,
  startRouteReading,
  closeRouteReader,
  openEventDetail,
  closeDetailPanel,
  applyEntityFilter,
  applyRelationFilter,
  applyTimeRange,
  clearAllFilters
} from "../state-machine.mjs";

let state = createInitialUiState();
state = startRouteReading(state, "westernMain", 4);
assert.equal(state.mode, "routeReading");
assert.equal(state.activeRouteId, "westernMain");
assert.equal(state.routeStep, 4);
assert.equal(state.panels.routeReaderOpen, true);

state = closeRouteReader(state, { keepRouteFilter: false });
assert.equal(state.mode, "exploring");
assert.equal(state.activeRouteId, "all");
assert.equal(state.panels.routeReaderOpen, false);
assert.equal(state.panels.detailOpen, false);
assert.deepEqual(state.selected, { kind: "none", id: null });

state = startRouteReading(createInitialUiState(), "westernMain", 2);
state = closeRouteReader(state, { keepRouteFilter: true });
assert.equal(state.mode, "filtered");
assert.equal(state.activeRouteId, "westernMain");
assert.equal(state.panels.routeReaderOpen, false);

state = startRouteReading(createInitialUiState(), "westernMain", 1);
state = openEventDetail(state, "hebrew", { routeEventIds: ["mesopotamia", "hebrew"] });
assert.equal(state.mode, "routeReading");
assert.equal(state.routeStep, 1);
assert.equal(state.panels.routeReaderOpen, true);
assert.equal(state.panels.detailOpen, true);
assert.deepEqual(state.selected, { kind: "event", id: "hebrew" });
state = closeDetailPanel(state);
assert.equal(state.mode, "routeReading");
assert.equal(state.panels.routeReaderOpen, true);
assert.equal(state.panels.detailOpen, false);

state = startRouteReading(createInitialUiState(), "westernMain", 1);
state = openEventDetail(state, "athens", { routeEventIds: ["mesopotamia", "hebrew"] });
assert.equal(state.routeStep, 1, "temporary non-route detail must not change route step");
assert.equal(state.mode, "routeReading");

state = startRouteReading(createInitialUiState(), "westernMain", 1);
state = applyEntityFilter(state, "france");
assert.equal(state.mode, "filtered");
assert.equal(state.activeEntityId, "france");
assert.equal(state.panels.routeReaderOpen, false);

state = applyRelationFilter(createInitialUiState(), "conflict");
assert.equal(state.mode, "filtered");
assert.equal(state.activeRelationId, "conflict");

state = applyTimeRange(createInitialUiState(), { from: 1500, to: 1800, label: "1500-1800" });
assert.equal(state.mode, "filtered");
assert.deepEqual(state.activeTimeRange, { from: 1500, to: 1800, label: "1500-1800" });

state = clearAllFilters(state);
assert.equal(state.mode, "exploring");
assert.equal(state.activeRouteId, "all");
assert.equal(state.activeEntityId, "all");
assert.equal(state.activeRelationId, "all");
assert.equal(state.activeTimeRange, null);
assert.deepEqual(state.selected, { kind: "none", id: null });
