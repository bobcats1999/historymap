import assert from "node:assert/strict";
import {
  applyEntityFilter,
  closeFilterPanel,
  createInitialUiState,
  createInitialAudioState,
  getPanelPresentation,
  openFilterPanel,
  resolveAudioAvailability,
  startStory,
  toggleAudioMuted,
  toggleStoryPlayback
} from "../state-machine.mjs";

const routeEventIds = ["egypt", "mesopotamia", "hebrew"];

let state = createInitialUiState({ isMobile: true, isPortrait: true });
assert.equal(state.story.panelState, "mini");
assert.equal(state.panels.storyFilterPeekOpen, false);

state = startStory(state, "westernMain", 1, routeEventIds);
state = toggleStoryPlayback(state, true);
state.panels.routeReaderExpanded = true;
state.story.panelState = "expanded";

state = openFilterPanel(state);
assert.equal(state.mode, "story");
assert.equal(state.story.isPlaying, false);
assert.equal(state.story.wasPlayingBeforeOverlay, true);
assert.equal(state.story.panelState, "mini");
assert.equal(state.panels.routeReaderExpanded, false);
assert.equal(state.panels.filterOpen, false);
assert.equal(state.panels.storyFilterPeekOpen, true);
assert.equal(getPanelPresentation(state).filter, "peek");

state = closeFilterPanel(state);
assert.equal(state.mode, "story");
assert.equal(state.story.isPlaying, true);
assert.equal(state.panels.storyFilterPeekOpen, false);
assert.equal(getPanelPresentation(state).storyGuide, "mini");

state = openFilterPanel(toggleStoryPlayback(state, false));
state = closeFilterPanel(state);
assert.equal(state.story.isPlaying, false, "closing a filter peek should not resume if the story was already paused");

state = startStory(createInitialUiState({ isMobile: true, isPortrait: true }), "westernMain", 1, routeEventIds);
state = toggleStoryPlayback(state, true);
state = openFilterPanel(state);
state = applyEntityFilter(state, "france");
assert.equal(state.mode, "filtered");
assert.equal(state.story.isPlaying, false);
assert.equal(state.story.panelState, "closed");
assert.equal(state.story.lastStep, 1);
assert.equal(state.panels.storyFilterPeekOpen, false);
assert.equal(state.panels.routeReaderOpen, false);
assert.equal(state.activeEntityId, "france");

let audio = createInitialAudioState();
assert.equal(audio.enabled, false);
assert.equal(audio.muted, true);
assert.equal(resolveAudioAvailability(audio, false).licenseReady, false);
assert.equal(resolveAudioAvailability(audio, true).licenseReady, true);
audio = toggleAudioMuted(resolveAudioAvailability(audio, true));
assert.equal(audio.enabled, true);
assert.equal(audio.muted, false);
audio = toggleAudioMuted(audio);
assert.equal(audio.enabled, true);
assert.equal(audio.muted, true);
