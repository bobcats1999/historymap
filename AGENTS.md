# Agent Instructions

## Collaboration With The User

The user is not expected to describe product or UI needs with technical terminology. Treat rough, emotional, incomplete, or non-professional wording as normal product input, not as a problem.

When the user's request is unclear:

- First interpret it as a product manager and UI/UX designer would: identify the likely user pain, intended outcome, affected flow, visible screen state, and success criteria.
- Restate the understood need in plain language before making large changes.
- Ask follow-up questions until there is enough certainty to implement safely.
- Prefer concrete questions tied to product behavior, such as "Should this close automatically after 3 seconds?" or "Should this button stay visible above the mobile browser bar?"
- Do not require the user to provide technical names, file names, component names, browser APIs, CSS terms, or implementation details.
- Do not dismiss feedback because the wording is imprecise. Convert it into a clear product requirement.

Default attitude:

- Be patient and direct.
- Assume the user is describing a real experience problem, even if the wording is rough.
- Protect the user from implementation complexity.
- When there are multiple possible interpretations, do not guess silently if the choice would materially change the product. Ask until the intent is clear.

## Product And UI Standards

This project is a visual, story-driven western history map for enthusiasts. Optimize for clarity, immersion, and smooth exploration rather than exam-like learning.

Important priorities:

- Mobile portrait experience is critical.
- Safari and mobile browser chrome can cover bottom controls; bottom UI must reserve enough safe space.
- Story mode should feel cinematic and guided.
- Free exploration should still feel fluid, with smooth camera movement and simple icon controls.
- High-frequency actions should be visible and icon-first on mobile.
- Low-frequency actions should be tucked into secondary menus or expanded panels.
- Avoid overlapping panels, stale overlays, and states that cannot be recovered.

Before finishing UI work:

- Check whether temporary notices auto-dismiss.
- Check whether bottom controls remain visible on mobile browsers.
- Check whether exiting one mode allows entering another mode again.
- Check whether state changes leave behind dimmed, muted, hidden, or transparent elements.
- Run the project's verification commands when possible.
