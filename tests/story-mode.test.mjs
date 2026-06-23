import assert from "node:assert/strict";
import {
  applyEntityFilter,
  closeDetailPanel,
  closeStoryPanel,
  continueStory,
  createInitialUiState,
  getPanelPresentation,
  goToStoryStep,
  openEventDetail,
  startStory,
  switchStory,
  toggleStoryPlayback
} from "../state-machine.mjs";

const routeEventIds = ["a", "b", "c", "d", "e"];

let state = createInitialUiState();
state = startStory(state, "westernMain", 2, routeEventIds);
assert.equal(state.mode, "story");
assert.equal(state.activeRouteId, "westernMain");
assert.equal(state.routeStep, 2);
assert.equal(state.story.routeId, "westernMain");
assert.equal(state.story.step, 2);
assert.equal(state.story.focusEventId, "c");
assert.equal(state.story.transitionId, 1);
let transitionId = state.story.transitionId;
assert.equal(state.story.panelState, "expanded");
assert.equal(state.story.isPlaying, false);
assert.equal(state.panels.routeReaderOpen, true);

state = closeStoryPanel(state);
assert.equal(state.mode, "exploring");
assert.equal(state.activeRouteId, "all");
assert.equal(state.panels.routeReaderOpen, false);
assert.equal(state.story.lastRouteId, "westernMain");
assert.equal(state.story.lastStep, 2);

state = continueStory(state);
assert.equal(state.mode, "story");
assert.equal(state.activeRouteId, "westernMain");
assert.equal(state.routeStep, 2);
assert.equal(state.panels.routeReaderOpen, true);

state = goToStoryStep(state, 4, routeEventIds);
assert.equal(state.story.step, 4);
assert.equal(state.routeStep, 4);
assert.equal(state.story.focusEventId, "e");
assert.ok(state.story.transitionId > transitionId, "story step changes should advance transition id");
transitionId = state.story.transitionId;

state = toggleStoryPlayback(state, true);
assert.equal(state.story.isPlaying, true);
state = openEventDetail(state, "not-in-story", { routeEventIds: ["a", "b"] });
assert.equal(state.mode, "story");
assert.equal(state.story.isPlaying, false);
assert.equal(state.story.step, 4);
assert.equal(state.panels.detailOpen, true);
state = closeDetailPanel(state);
assert.equal(state.mode, "story");
assert.equal(state.story.step, 4);
assert.equal(state.panels.routeReaderOpen, true);

state = applyEntityFilter(state, "france");
assert.equal(state.mode, "filtered");
assert.equal(state.story.isPlaying, false);
assert.equal(state.panels.routeReaderOpen, false);
assert.equal(state.story.lastStep, 4);
assert.equal(state.activeRouteId, "all");
assert.equal(state.activeEntityId, "france");

state = switchStory(state, "churchCrown", 0);
assert.equal(state.mode, "story");
assert.equal(state.activeRouteId, "churchCrown");
assert.equal(state.story.routeId, "churchCrown");
assert.equal(state.story.step, 0);
assert.equal(state.activeEntityId, "all");

let mobile = startStory(createInitialUiState({ isMobile: true, isPortrait: true }), "westernMain", 0, routeEventIds);
assert.equal(getPanelPresentation(mobile).storyGuide, "mini");
mobile = openEventDetail(mobile, "athens", { routeEventIds: ["mesopotamia"] });
assert.equal(getPanelPresentation(mobile).storyGuide, "suspended");

const landscape = startStory(createInitialUiState({ isMobile: true, isPortrait: false }), "westernMain", 0, routeEventIds);
assert.equal(getPanelPresentation(landscape).storyGuide, "rail");
