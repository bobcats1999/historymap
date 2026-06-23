import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../script.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.equal(
  html.includes("onpointerdown=\"closeIntroModal()\""),
  false,
  "intro buttons must not close on pointerdown, because real mobile touch sequences can cancel the entry auto-zoom"
);

assert.match(
  script,
  /let introInteractionLockUntil = 0;/,
  "entry flow should track a short interaction lock after closing the intro"
);

assert.match(
  script,
  /if \(introAutoPending && Date\.now\(\) < introInteractionLockUntil\) return false;/,
  "map interaction should not clear the pending intro auto-zoom during the entry tap"
);

assert.match(
  script,
  /function isMobilePortraitViewport\(\)/,
  "entry flow should have a dedicated mobile portrait viewport branch"
);

assert.match(
  script,
  /function fitMobileEntryPreview\(/,
  "mobile portrait entry should use a curated route preview instead of the full-map fit"
);

assert.match(
  script,
  /mobile-entry-preview/,
  "mobile portrait entry should expose a CSS state for the curated cover treatment"
);

assert.match(
  script,
  /minZoom:\s*mobileReadableZoom,\s*maxZoom:\s*0\.3/,
  "mobile portrait preview zoom should stay in the 24%-30% range instead of falling to the 10% full-map zoom"
);

assert.match(
  script,
  /const mobileReadableZoom = 0\.24;/,
  "mobile low-zoom presentation should have one shared readable threshold"
);

assert.match(
  script,
  /mobileLowZoomPreview:\s*true/,
  "selection and whole-map fits should opt into the mobile low-zoom preview strategy"
);

assert.match(
  script,
  /function updateMobileFitPreview\(/,
  "low-zoom fits should use a reusable mobile fit preview state"
);

assert.match(
  script,
  /app\.classList\.toggle\("mobile-low-zoom", lowZoom\)/,
  "manual mobile zoom below the readable threshold should simplify map labels"
);

assert.match(
  script,
  /fitCurrentSelection\(\);\n\s+collapseControlsOnMobile\(\);/,
  "route cards in the filter drawer should fit via the same mobile low-zoom strategy"
);
