import assert from "node:assert/strict";
import {
  createInitialUiState,
  startRouteReading,
  closeRouteReader,
  deriveGraphScope
} from "../state-machine.mjs";

const routeState = startRouteReading(createInitialUiState(), "churchCrown", 3);
const exited = closeRouteReader(routeState, { keepRouteFilter: false });
assert.equal(exited.mode, "exploring");
assert.equal(exited.activeRouteId, "all");
assert.equal(exited.panels.routeReaderOpen, false);
assert.equal(exited.panels.detailOpen, false);
assert.equal(deriveGraphScope(exited).routeId, "all");

const filtered = closeRouteReader(routeState, { keepRouteFilter: true });
assert.equal(filtered.mode, "filtered");
assert.equal(filtered.activeRouteId, "churchCrown");
assert.equal(filtered.panels.routeReaderOpen, false);
assert.equal(deriveGraphScope(filtered).routeId, "churchCrown");
