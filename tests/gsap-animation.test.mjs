import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

assert.match(
  html,
  /<script src="vendor\/gsap\.min\.js"><\/script>\s*<script type="module" src="script\.js"><\/script>/,
  "the app should load local GSAP before the module script so UI animation uses one shared engine offline"
);

assert.match(
  script,
  /function getGsap\(\)/,
  "script should centralize GSAP access instead of scattering window.gsap checks"
);

assert.match(
  script,
  /function prefersReducedMotion\(\)/,
  "animations should respect the user's reduced-motion preference"
);

assert.match(
  script,
  /function animateStoryFocusHud\(\)/,
  "story focus HUD should use a scoped GSAP entrance animation"
);

assert.match(
  script,
  /function syncGlobalMapControlsMotion\(shouldHide\)/,
  "bottom map controls should animate through a dedicated GSAP sync function"
);

assert.match(
  script,
  /gsap\.to\(cameraState,[\s\S]*?ease: "power3\.inOut"/,
  "story camera movement should use a GSAP tween with a cinematic ease"
);

assert.match(
  script,
  /gsap\.to\(zoomState,[\s\S]*?ease: "power3\.out"/,
  "entry zoom movement should use a GSAP tween with an interruptible ease"
);

assert.doesNotMatch(
  script,
  /const tick = \(now\) => \{[\s\S]*?requestAnimationFrame\(tick\);[\s\S]*?function renderStoryFocusHud/,
  "story camera should not keep a hand-rolled requestAnimationFrame loop"
);

assert.doesNotMatch(
  script,
  /const tick = \(\) => \{[\s\S]*?requestAnimationFrame\(tick\);[\s\S]*?function showLandscapeHint/,
  "entry zoom should not keep a hand-rolled requestAnimationFrame loop"
);

assert.match(
  css,
  /\.story-focus-hud \{[\s\S]*?will-change: transform, opacity;/,
  "story focus HUD should hint only the transform and opacity properties it animates"
);

assert.match(
  css,
  /\.global-map-controls \{[\s\S]*?will-change: transform, opacity;/,
  "bottom map controls should hint only the transform and opacity properties they animate"
);
