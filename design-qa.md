# Design QA

final result: passed

## Verified

- Page renders at `http://127.0.0.1:8010`.
- SVG links no longer use `marker-end`; arrow marker count is `0`.
- Default link path opacity is `0.4`.
- Zoom button interaction updates the map from `100%` to `112%`, including status bar text and SVG rendered width.
- Clicking the `hebrew` event opens the detail panel with title `犹太一神传统`.
- Detail panel uses a fixed/sticky header, hidden outer overflow, and independently scrollable body content.
- Museum archive styling is applied: dark guide toolbar, archive-style status ledger, filter drawer, and ivory detail card.
- Generated kraft-paper canvas texture is applied from `assets/kraft-paper-archive.png`.
- Removed the old map texture overlay that produced odd large background shapes.
- Filter drawer opens from the toolbar and changes the trigger text to `收起筛选`.
- Detail archive badges render for the selected event.
- Status ledger updates the selected object, for example `选中：犹太一神传统`.
- Event detail content now includes richer sections: key person cards, archive image asset, historical context, and significance.
- Bottom timeline ruler is fixed in the current viewport and renders visible year ticks plus Chinese dynasty bands.
- Timeline year ticks and Chinese dynasty bands are clickable range filters; content outside the selected interval is muted.
- SVG event/link nodes no longer receive focus boxes on click.
- Event flags are larger, and SVG text uses an inverse zoom variable so visual text size stays stable while zooming.
- Classical event icon now uses a clearer museum/classical-building symbol instead of `柱`.
- Event flags are rendered as tightly spaced SVG `tspan` tokens and hide automatically below `86%` zoom, then reappear when zoomed back in.
- Region heights, lane counts, and node spacing were increased to reduce event/event, text/text, and text/event overlaps.
- Bottom status ledger was removed; route, entity, relation, zoom, and selected state now live in the top toolbar context chips.
- Mobile collapsed header shows only the title and selected archive state; tapping the header expands the route/entity filters and relation drawer.
- Mobile collapsed header now includes a visible dropdown button next to the title so the expandable control is discoverable.
- Mobile expanded relationship filter uses a bottom drawer layout to avoid overlapping the header selects.
- Mobile `回到选中` control uses an icon-only label while preserving the accessible text label.
- Timeline ruler is flush with the mobile viewport bottom after the status ledger removal.
- SVG viewBox now matches the expanded graph height.
- Dragging the map after selecting a timeline/dynasty range clears the active period filter and returns to all periods.
- Mobile graph supports two-finger pinch zoom using the existing zoom engine and centers zooming on the pinch midpoint.
- Mobile zoom controls stay hidden by default, appear during pinch zoom, and auto-hide after three seconds without pinch activity.
- Mobile first-load guidance shows `通过双指捏合缩放` with a generated pinch illustration, includes a close button, supports outside-click dismissal, uses a translucent dark overlay, and still auto-dismisses after three seconds.
- Detail panel closes after a deliberate map drag threshold, while tiny map movements do not immediately dismiss it.
- Detail visual icons include visible meaning labels and title tooltips.
- Link hover and event hover use dedicated highlighted states; event hover renders a short preview tooltip.
- Mobile 390px layout has no horizontal overflow after toolbar tightening.
- Intro briefing modal appears before the pinch guide and explains what the map is for; closing it starts the mobile pinch guide flow.
- Initial map view now fits the full graph first, then auto-zooms into a readable route entry after three seconds unless the user interacts with the map.
- Route/entity/relation filter changes fit the current visible route or line set into the viewport.
- Mobile landscape layout is optimized with a compact collapsed header, fit-to-bottom timeline, and landscape-specific drawer/detail sizing.
- Mobile portrait view shows a dedicated `请横屏浏览` prompt.
- Mobile map interaction collapses the expanded filter drawer before continuing with map/event behavior.
- Full-map entry now uses an overview mode that renders only major trunk events and trunk links.
- The kraft-paper map texture is also applied to the scroll container, so the viewport remains covered when the SVG is scaled smaller than the screen.
- Region titles are rendered once per band instead of repeated across the SVG.
- Intro close starts a guarded auto-zoom sequence with an animated zoom-to-entry transition, while actual map movement can still cancel pending auto zoom.
- Mobile zoom controls are hidden by default in portrait and landscape and only appear during gesture zoom.
- Portrait mobile now shows a non-blocking `建议横屏浏览` advisory instead of a forced full-screen orientation blocker.
- Low-height landscape layouts use left/right control placement so the toolbar and filter drawer do not overlap.
- Event/link pointer handling no longer exits overview before click dispatch, so clicking events opens the archive detail panel again.
- Entry overview now starts auto-zoom after 0.5 seconds on desktop and mobile.
- Non-trunk events and links are present during overview with opacity `0`, then fade in during the zoom animation before overview mode exits.
- Region titles update their SVG x-position on scroll/zoom, keeping one visible title per region in the current viewport.
- Mobile filter drawer was tightened into a bottom-sheet control layout with grid chips and a sticky legend; landscape keeps the left toolbar/right drawer split.
- Entry auto-zoom is gated behind the intro close/`进入地图` action; without clicking, the map remains in 13% overview mode.
- Detail title badges use a single-line nowrap row with horizontal scrolling instead of wrapping.
- Landscape filter drawer has extra top offset and verified separation from the toolbar/content area.
- Mobile portrait entry flow now auto-zooms after tapping `进入地图`, reaching the readable `42%` route view.
- Mobile portrait `建议横屏浏览` advisory is hidden on entry, appears only after the entry zoom completes, and auto-hides after three seconds.
- Mobile entry button no longer closes on `pointerdown`; a regression test covers the touch-entry path so the pending auto-zoom is not canceled by the same tap.
- Mobile portrait entry now uses a curated `mobile-entry-preview` route view at `24%` zoom with 7 visible mainline events and an archive cover overlay, instead of the old `10%` full-map thumbnail.
- Mobile landscape and desktop still use the original full-map overview entry and do not display the mobile entry cover.
- Mobile route/entity/relation/time/whole-map fits now share a `24%` readable low-zoom threshold; low-fit results enter `mobile-fit-preview` instead of forcing an unreadable full-route thumbnail.
- Mobile route filtering was verified with `宗教与王权如何缠绕？`: the view stays at `24%`, highlights 14 route events, hides dense flags/link labels, and shows a route overview note.
- Mobile zooming above the readable threshold exits `mobile-fit-preview` and restores normal map labeling behavior.
- JavaScript syntax check passes with `node --check script.js`.

## Notes

- Final desktop overview screenshot is saved at `network-check-final.png`.
- Mobile spot-check screenshot is saved at `network-check-mobile.png`.
- Pinch guide asset is saved at `assets/pinch-zoom-guide.png`.
