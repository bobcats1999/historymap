import assert from "node:assert/strict";
import {
  createInitialUiState,
  startRouteReading,
  openEventDetail,
  closeDetailPanel,
  openFilterPanel,
  closeFilterPanel,
  getPanelPresentation
} from "../state-machine.mjs";

let state = createInitialUiState({ isMobile: true, isPortrait: true });
state = startRouteReading(state, "westernMain", 0);
assert.equal(getPanelPresentation(state).routeReader, "mini");

state = openEventDetail(state, "mesopotamia", { routeEventIds: ["mesopotamia"] });
assert.equal(getPanelPresentation(state).detail, "open");
assert.equal(getPanelPresentation(state).routeReader, "suspended");

state = closeDetailPanel(state);
assert.equal(getPanelPresentation(state).detail, "closed");
assert.equal(getPanelPresentation(state).routeReader, "mini");

state = openFilterPanel(state);
assert.equal(getPanelPresentation(state).filter, "open");
assert.equal(getPanelPresentation(state).routeReader, "mini");

state = closeFilterPanel(state);
assert.equal(getPanelPresentation(state).filter, "closed");
assert.equal(getPanelPresentation(state).routeReader, "mini");

const desktop = startRouteReading(createInitialUiState({ isMobile: false }), "westernMain", 0);
assert.equal(getPanelPresentation(desktop).routeReader, "expanded");
