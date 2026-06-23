import assert from "node:assert/strict";
import {
  calculateStoryCameraTarget,
  getStoryFocusViewport
} from "../story-camera.mjs";

const desktop = getStoryFocusViewport({
  width: 1440,
  height: 900,
  isMobile: false,
  isPortrait: false,
  storyPanelOpen: true,
  detailOpen: false,
  filterOpen: false
});
assert.equal(desktop.left, 0);
assert.ok(desktop.right <= 1000, "desktop safe viewport should leave room for the right story panel");
assert.equal(desktop.focusX, Math.round((desktop.left + desktop.right) / 2));

const portrait = getStoryFocusViewport({
  width: 390,
  height: 844,
  isMobile: true,
  isPortrait: true,
  storyPanelOpen: true,
  detailOpen: false,
  filterOpen: false
});
assert.ok(portrait.bottom < 610, "portrait safe viewport should stop above the bottom story sheet");
assert.ok(portrait.focusY < portrait.bottom, "portrait focus should remain visible above the sheet");

const landscape = getStoryFocusViewport({
  width: 920,
  height: 430,
  isMobile: true,
  isPortrait: false,
  storyPanelOpen: true,
  detailOpen: false,
  filterOpen: false
});
assert.ok(landscape.right < 620, "landscape safe viewport should leave room for the right rail");

const target = calculateStoryCameraTarget({
  eventPosition: { x: 4200, y: 1400 },
  scrollerSize: { width: 1440, height: 900 },
  graphSize: { width: 9800, height: 3140 },
  targetZoom: 1,
  focusViewport: desktop
});
assert.equal(4200 - target.left, desktop.focusX);
assert.equal(1400 - target.top, desktop.focusY);
