export function getStoryFocusViewport(options = {}) {
  const width = Math.max(1, Number(options.width) || 1);
  const height = Math.max(1, Number(options.height) || 1);
  const isMobile = Boolean(options.isMobile);
  const isPortrait = Boolean(options.isPortrait);
  const storyPanelOpen = options.storyPanelOpen !== false;
  const detailOpen = Boolean(options.detailOpen);
  const filterOpen = Boolean(options.filterOpen);

  let left = 0;
  let top = 0;
  let right = width;
  let bottom = height;

  if (!isMobile) {
    top = 72;
    bottom = height - 58;
    if (storyPanelOpen || detailOpen) right -= Math.min(500, Math.max(460, width * 0.32));
    if (filterOpen) left += Math.min(380, Math.max(300, width * 0.24));
  } else if (isPortrait) {
    top = 74;
    bottom = storyPanelOpen ? Math.round(height * 0.58) : height - 58;
    if (detailOpen) bottom = Math.round(height * 0.46);
    if (filterOpen) bottom = Math.round(height * 0.42);
  } else {
    top = 54;
    bottom = height - 48;
    if (storyPanelOpen || detailOpen) right -= Math.min(380, Math.max(300, width * 0.38));
    if (filterOpen) left += Math.min(300, Math.max(240, width * 0.3));
  }

  right = Math.max(left + 120, right);
  bottom = Math.max(top + 120, bottom);
  return {
    left: Math.round(left),
    top: Math.round(top),
    right: Math.round(right),
    bottom: Math.round(bottom),
    focusX: Math.round((left + right) / 2),
    focusY: Math.round((top + bottom) / 2)
  };
}

export function calculateStoryCameraTarget(options = {}) {
  const eventPosition = options.eventPosition || { x: 0, y: 0 };
  const scrollerSize = options.scrollerSize || { width: 1, height: 1 };
  const graphSize = options.graphSize || { width: 1, height: 1 };
  const targetZoom = Math.max(0.01, Number(options.targetZoom) || 1);
  const focusViewport = options.focusViewport || getStoryFocusViewport({
    width: scrollerSize.width,
    height: scrollerSize.height
  });
  const maxLeft = Math.max(0, graphSize.width * targetZoom - scrollerSize.width);
  const maxTop = Math.max(0, graphSize.height * targetZoom - scrollerSize.height);
  const left = clamp(eventPosition.x * targetZoom - focusViewport.focusX, 0, maxLeft);
  const top = clamp(eventPosition.y * targetZoom - focusViewport.focusY, 0, maxTop);
  return {
    left: Math.round(left),
    top: Math.round(top),
    zoom: targetZoom,
    focusViewport
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
