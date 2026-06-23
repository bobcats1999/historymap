const validModes = new Set(["overview", "exploring", "routeReading", "story", "filtered", "detail"]);

export function createInitialUiState(viewport = {}) {
  return {
    mode: "overview",
    activeRouteId: "all",
    routeStep: 0,
    activeEntityId: "all",
    activeRelationId: "all",
    activeTimeRange: null,
    selected: { kind: "none", id: null },
    audio: createInitialAudioState(),
    story: {
      routeId: "westernMain",
      step: 0,
      isPlaying: false,
      panelState: viewport.isMobile ? "mini" : "expanded",
      lastRouteId: "westernMain",
      lastStep: 0,
      hasStarted: false,
      transitioning: false,
      transitionId: 0,
      focusEventId: null,
      wasPlayingBeforeOverlay: false,
      returnMode: "exploring"
    },
    panels: {
      controlsOpen: false,
      filterOpen: false,
      storyFilterPeekOpen: false,
      routeReaderOpen: false,
      routeReaderExpanded: false,
      detailOpen: false,
      introOpen: true,
      mobileGuideOpen: false
    },
    viewport: {
      isMobile: Boolean(viewport.isMobile),
      isPortrait: Boolean(viewport.isPortrait),
      lowZoomPreview: Boolean(viewport.lowZoomPreview)
    }
  };
}

export function cloneState(state) {
  return {
    ...state,
    selected: { ...(state.selected || { kind: "none", id: null }) },
    audio: { ...createInitialAudioState(), ...(state.audio || {}) },
    story: { ...defaultStoryState(), ...(state.story || {}) },
    panels: { ...(state.panels || {}) },
    viewport: { ...(state.viewport || {}) },
    activeTimeRange: state.activeTimeRange ? { ...state.activeTimeRange } : null
  };
}

function defaultStoryState() {
  return {
    routeId: "westernMain",
    step: 0,
    isPlaying: false,
    panelState: "expanded",
    lastRouteId: "westernMain",
    lastStep: 0,
    hasStarted: false,
    transitioning: false,
    transitionId: 0,
    focusEventId: null,
    wasPlayingBeforeOverlay: false,
    returnMode: "exploring"
  };
}

export function setMode(state, mode) {
  const next = cloneState(state);
  next.mode = validModes.has(mode) ? mode : "exploring";
  return next;
}

export function updateViewport(state, viewport = {}) {
  const next = cloneState(state);
  next.viewport = {
    ...next.viewport,
    isMobile: Boolean(viewport.isMobile),
    isPortrait: Boolean(viewport.isPortrait),
    lowZoomPreview: Boolean(viewport.lowZoomPreview)
  };
  if (next.mode === "story" && next.panels.routeReaderOpen) {
    next.story.panelState = next.viewport.isMobile ? "mini" : "expanded";
    next.panels.routeReaderExpanded = !next.viewport.isMobile;
  }
  return next;
}

export function startStory(state, routeId, routeStep = 0, routeEventIds = []) {
  const next = cloneState(state);
  const storyRouteId = routeId || next.story.lastRouteId || "westernMain";
  const step = Math.max(0, Number(routeStep) || 0);
  next.mode = "story";
  next.activeRouteId = storyRouteId;
  next.routeStep = step;
  next.activeEntityId = "all";
  next.activeRelationId = "all";
  next.activeTimeRange = null;
  next.selected = { kind: "none", id: null };
  next.panels.filterOpen = false;
  next.panels.storyFilterPeekOpen = false;
  next.panels.detailOpen = false;
  next.panels.routeReaderOpen = true;
  next.panels.routeReaderExpanded = !next.viewport.isMobile;
  next.panels.introOpen = false;
  next.story = {
    ...next.story,
    routeId: storyRouteId,
    step,
    isPlaying: false,
    panelState: next.viewport.isMobile ? "mini" : "expanded",
    lastRouteId: storyRouteId,
    lastStep: step,
    hasStarted: true,
    transitioning: false,
    transitionId: next.story.transitionId + 1,
    focusEventId: optionsRouteEventId(routeEventIds, step),
    wasPlayingBeforeOverlay: false,
    returnMode: "story"
  };
  return next;
}

export function continueStory(state) {
  const next = cloneState(state);
  return startStory(next, next.story.lastRouteId || next.story.routeId || "westernMain", next.story.lastStep || 0);
}

export function switchStory(state, routeId, routeStep = 0, routeEventIds = []) {
  return startStory(state, routeId, routeStep, routeEventIds);
}

export function goToStoryStep(state, routeStep = 0, routeEventIds = []) {
  const next = cloneState(state);
  const step = Math.max(0, Number(routeStep) || 0);
  next.mode = "story";
  next.activeRouteId = next.story.routeId || next.activeRouteId || "westernMain";
  next.routeStep = step;
  next.panels.routeReaderOpen = true;
  next.panels.routeReaderExpanded = !next.viewport.isMobile;
  next.story = {
    ...next.story,
    step,
    lastRouteId: next.story.routeId || next.activeRouteId || "westernMain",
    lastStep: step,
    hasStarted: true,
    transitionId: next.story.transitionId + 1,
    focusEventId: optionsRouteEventId(routeEventIds, step),
    returnMode: "story"
  };
  return next;
}

export function toggleStoryPlayback(state, isPlaying) {
  const next = cloneState(state);
  next.story.isPlaying = typeof isPlaying === "boolean" ? isPlaying : !next.story.isPlaying;
  return next;
}

export function setStoryTransitioning(state, transitioning) {
  const next = cloneState(state);
  next.story.transitioning = Boolean(transitioning);
  if (transitioning) next.story.transitionId += 1;
  return next;
}

export function closeStoryPanel(state) {
  const next = cloneState(state);
  next.story = {
    ...next.story,
    isPlaying: false,
    panelState: "closed",
    lastRouteId: next.story.routeId || next.activeRouteId || next.story.lastRouteId || "westernMain",
    lastStep: Number.isInteger(next.story.step) ? next.story.step : next.routeStep,
    hasStarted: true,
    transitioning: false,
    transitionId: next.story.transitionId + 1,
    returnMode: "exploring"
  };
  next.mode = "exploring";
  next.activeRouteId = "all";
  next.routeStep = 0;
  next.selected = { kind: "none", id: null };
  next.panels.routeReaderOpen = false;
  next.panels.routeReaderExpanded = false;
  next.panels.storyFilterPeekOpen = false;
  next.panels.detailOpen = false;
  next.viewport.lowZoomPreview = false;
  return next;
}

export function exitStoryMode(state) {
  return closeStoryPanel(state);
}

export function startRouteReading(state, routeId, routeStep = 0) {
  const next = cloneState(state);
  next.mode = "routeReading";
  next.activeRouteId = routeId || "all";
  next.routeStep = Math.max(0, Number(routeStep) || 0);
  next.panels.routeReaderOpen = true;
  next.panels.routeReaderExpanded = !next.viewport.isMobile;
  next.panels.filterOpen = false;
  next.panels.introOpen = false;
  next.activeEntityId = "all";
  next.activeRelationId = "all";
  next.activeTimeRange = null;
  return next;
}

export function closeRouteReader(state, options = {}) {
  const keepRouteFilter = Boolean(options.keepRouteFilter);
  const next = cloneState(state);
  next.panels.routeReaderOpen = false;
  next.panels.routeReaderExpanded = false;
  next.panels.detailOpen = false;
  next.selected = { kind: "none", id: null };
  if (keepRouteFilter && next.activeRouteId !== "all") {
    next.mode = "filtered";
    return next;
  }
  next.mode = "exploring";
  next.activeRouteId = "all";
  next.routeStep = 0;
  next.viewport.lowZoomPreview = false;
  return next;
}

export function selectRouteFilter(state, routeId) {
  const next = cloneState(state);
  next.mode = routeId && routeId !== "all" ? "filtered" : "exploring";
  next.activeRouteId = routeId || "all";
  next.routeStep = 0;
  next.panels.routeReaderOpen = false;
  next.panels.routeReaderExpanded = false;
  next.panels.storyFilterPeekOpen = false;
  return next;
}

export function clearRouteFilter(state) {
  const next = cloneState(state);
  next.activeRouteId = "all";
  if (next.activeEntityId === "all" && next.activeRelationId === "all" && !next.activeTimeRange) {
    next.mode = "exploring";
  }
  return next;
}

export function openEventDetail(state, eventId, options = {}) {
  const next = cloneState(state);
  next.selected = { kind: "event", id: eventId };
  next.panels.detailOpen = true;
  next.panels.filterOpen = false;
  next.panels.storyFilterPeekOpen = false;
  if (next.mode === "story") {
    const routeEventIds = Array.isArray(options.routeEventIds) ? options.routeEventIds : [];
    const routeIndex = routeEventIds.indexOf(eventId);
    next.story.isPlaying = false;
    next.story.returnMode = "story";
    if (routeIndex >= 0) {
      next.routeStep = routeIndex;
      next.story.step = routeIndex;
      next.story.lastStep = routeIndex;
      next.story.focusEventId = eventId;
    }
    next.panels.routeReaderOpen = true;
    next.panels.routeReaderExpanded = false;
    return next;
  }
  if (next.mode === "routeReading") {
    const routeEventIds = Array.isArray(options.routeEventIds) ? options.routeEventIds : [];
    const routeIndex = routeEventIds.indexOf(eventId);
    if (routeIndex >= 0) next.routeStep = routeIndex;
    next.panels.routeReaderOpen = true;
    return next;
  }
  next.mode = "detail";
  return next;
}

export function openLinkDetail(state, linkId) {
  const next = cloneState(state);
  next.selected = { kind: "link", id: linkId };
  next.panels.detailOpen = true;
  next.panels.filterOpen = false;
  next.panels.storyFilterPeekOpen = false;
  if (next.mode === "story") {
    next.story.isPlaying = false;
    next.story.returnMode = "story";
    return next;
  }
  if (next.mode !== "routeReading") next.mode = "detail";
  return next;
}

export function closeDetailPanel(state) {
  const next = cloneState(state);
  next.panels.detailOpen = false;
  next.selected = { kind: "none", id: null };
  if (next.story.returnMode === "story" && next.story.panelState !== "closed") {
    next.mode = "story";
    next.panels.routeReaderOpen = true;
    return next;
  }
  if (next.mode === "detail") {
    next.mode = hasActiveFilter(next) ? "filtered" : "exploring";
  }
  return next;
}

export function applyEntityFilter(state, entityId) {
  const next = cloneState(state);
  pauseStoryForModeExit(next);
  next.mode = entityId && entityId !== "all" ? "filtered" : modeForRemainingFilters({ ...next, activeEntityId: "all" });
  next.activeEntityId = entityId || "all";
  next.panels.routeReaderOpen = false;
  next.panels.routeReaderExpanded = false;
  next.panels.storyFilterPeekOpen = false;
  return next;
}

export function applyRelationFilter(state, relationId) {
  const next = cloneState(state);
  pauseStoryForModeExit(next);
  next.mode = relationId && relationId !== "all" ? "filtered" : modeForRemainingFilters({ ...next, activeRelationId: "all" });
  next.activeRelationId = relationId || "all";
  next.panels.routeReaderOpen = false;
  next.panels.routeReaderExpanded = false;
  next.panels.storyFilterPeekOpen = false;
  return next;
}

export function applyTimeRange(state, range) {
  const next = cloneState(state);
  pauseStoryForModeExit(next);
  next.mode = range ? "filtered" : modeForRemainingFilters({ ...next, activeTimeRange: null });
  next.activeTimeRange = range ? { ...range } : null;
  next.panels.routeReaderOpen = false;
  next.panels.routeReaderExpanded = false;
  next.panels.storyFilterPeekOpen = false;
  return next;
}

export function openFilterPanel(state) {
  const next = cloneState(state);
  if (next.mode === "story" && next.viewport.isMobile && next.viewport.isPortrait) {
    next.story.wasPlayingBeforeOverlay = Boolean(next.story.isPlaying);
    next.story.isPlaying = false;
    next.story.panelState = "mini";
    next.panels.routeReaderOpen = true;
    next.panels.routeReaderExpanded = false;
    next.panels.filterOpen = false;
    next.panels.storyFilterPeekOpen = true;
    next.panels.detailOpen = false;
    return next;
  }
  next.panels.filterOpen = true;
  next.panels.storyFilterPeekOpen = false;
  if (next.viewport.isMobile) next.panels.routeReaderExpanded = false;
  return next;
}

export function closeFilterPanel(state) {
  const next = cloneState(state);
  next.panels.filterOpen = false;
  if (next.panels.storyFilterPeekOpen) {
    next.panels.storyFilterPeekOpen = false;
    if (next.mode === "story") {
      next.story.isPlaying = Boolean(next.story.wasPlayingBeforeOverlay);
      next.story.wasPlayingBeforeOverlay = false;
      next.panels.routeReaderOpen = true;
      next.panels.routeReaderExpanded = false;
      next.story.panelState = "mini";
    }
  }
  return next;
}

export function clearAllFilters(state) {
  const next = cloneState(state);
  next.mode = "exploring";
  next.activeRouteId = "all";
  next.routeStep = 0;
  next.activeEntityId = "all";
  next.activeRelationId = "all";
  next.activeTimeRange = null;
  next.selected = { kind: "none", id: null };
  next.panels.filterOpen = false;
  next.panels.storyFilterPeekOpen = false;
  next.panels.routeReaderOpen = false;
  next.panels.routeReaderExpanded = false;
  next.panels.detailOpen = false;
  next.story.isPlaying = false;
  next.story.panelState = "closed";
  next.viewport.lowZoomPreview = false;
  return next;
}

export function deriveGraphScope(state) {
  return {
    routeId: state.activeRouteId || "all",
    entityId: state.activeEntityId || "all",
    relationId: state.activeRelationId || "all",
    timeRange: state.activeTimeRange ? { ...state.activeTimeRange } : null
  };
}

export function getPanelPresentation(state) {
  const detail = state.panels.detailOpen ? "open" : "closed";
  const filter = state.panels.storyFilterPeekOpen ? "peek" : state.panels.filterOpen ? "open" : "closed";
  let routeReader = "closed";
  if (state.panels.routeReaderOpen) {
    if (state.viewport.isMobile && state.panels.detailOpen) routeReader = "suspended";
    else if (state.mode === "story" && state.viewport.isMobile && !state.viewport.isPortrait) routeReader = "rail";
    else if (state.viewport.isMobile) routeReader = state.panels.routeReaderExpanded ? "expanded" : "mini";
    else routeReader = "expanded";
  }
  return { detail, filter, routeReader, storyGuide: routeReader };
}

export function createInitialAudioState() {
  return {
    enabled: false,
    muted: true,
    volume: 0.32,
    licenseReady: false,
    hasTriedToLoad: false
  };
}

export function resolveAudioAvailability(audio = createInitialAudioState(), assetAvailable = false) {
  return {
    ...createInitialAudioState(),
    ...audio,
    licenseReady: Boolean(assetAvailable)
  };
}

export function toggleAudioMuted(audio = createInitialAudioState()) {
  return {
    ...createInitialAudioState(),
    ...audio,
    enabled: true,
    muted: !audio.muted
  };
}

export function createInitialProgress() {
  return {
    completedEventIds: [],
    completedQuizIds: [],
    lastRouteId: "westernMain",
    lastRouteStep: 0
  };
}

export function restoreProgress(value) {
  if (!value || typeof value !== "object") return createInitialProgress();
  return {
    completedEventIds: Array.isArray(value.completedEventIds) ? value.completedEventIds.filter(Boolean) : [],
    completedQuizIds: Array.isArray(value.completedQuizIds) ? value.completedQuizIds.filter(Boolean) : [],
    lastRouteId: typeof value.lastRouteId === "string" ? value.lastRouteId : "westernMain",
    lastRouteStep: Number.isInteger(value.lastRouteStep) && value.lastRouteStep >= 0 ? value.lastRouteStep : 0
  };
}

export function serializeProgress(progress) {
  return JSON.stringify(restoreProgress(progress));
}

export function dispatch(state, action) {
  switch (action.type) {
    case "START_ROUTE":
      return startRouteReading(state, action.routeId, action.routeStep);
    case "START_STORY":
      return startStory(state, action.routeId, action.routeStep, action.routeEventIds);
    case "CONTINUE_STORY":
      return continueStory(state);
    case "SWITCH_STORY":
      return switchStory(state, action.routeId, action.routeStep, action.routeEventIds);
    case "GO_TO_STORY_STEP":
      return goToStoryStep(state, action.routeStep, action.routeEventIds);
    case "CLOSE_STORY":
      return closeStoryPanel(state);
    case "TOGGLE_STORY_PLAYBACK":
      return toggleStoryPlayback(state, action.isPlaying);
    case "SET_STORY_TRANSITIONING":
      return setStoryTransitioning(state, action.transitioning);
    case "CLOSE_ROUTE":
      return closeRouteReader(state, { keepRouteFilter: action.keepRouteFilter });
    case "SELECT_ROUTE_FILTER":
      return selectRouteFilter(state, action.routeId);
    case "OPEN_EVENT":
      return openEventDetail(state, action.eventId, { routeEventIds: action.routeEventIds });
    case "OPEN_LINK":
      return openLinkDetail(state, action.linkId);
    case "CLOSE_DETAIL":
      return closeDetailPanel(state);
    case "APPLY_ENTITY":
      return applyEntityFilter(state, action.entityId);
    case "APPLY_RELATION":
      return applyRelationFilter(state, action.relationId);
    case "APPLY_TIME":
      return applyTimeRange(state, action.range);
    case "OPEN_FILTER":
      return openFilterPanel(state);
    case "CLOSE_FILTER":
      return closeFilterPanel(state);
    case "TOGGLE_AUDIO_MUTED":
      return { ...cloneState(state), audio: toggleAudioMuted(state.audio) };
    case "CLEAR_ALL":
      return clearAllFilters(state);
    case "SET_MODE":
      return setMode(state, action.mode);
    case "UPDATE_VIEWPORT":
      return updateViewport(state, action.viewport);
    default:
      return cloneState(state);
  }
}

function hasActiveFilter(state) {
  return state.activeRouteId !== "all" || state.activeEntityId !== "all" || state.activeRelationId !== "all" || Boolean(state.activeTimeRange);
}

function modeForRemainingFilters(state) {
  return hasActiveFilter(state) ? "filtered" : "exploring";
}

function pauseStoryForModeExit(next) {
  if (next.mode !== "story") return;
  next.story.isPlaying = false;
  next.story.panelState = "closed";
  next.story.lastRouteId = next.story.routeId || next.activeRouteId || next.story.lastRouteId || "westernMain";
  next.story.lastStep = Number.isInteger(next.story.step) ? next.story.step : next.routeStep;
  next.story.transitionId += 1;
  next.story.wasPlayingBeforeOverlay = false;
  next.activeRouteId = "all";
  next.routeStep = 0;
  next.panels.routeReaderOpen = false;
  next.panels.routeReaderExpanded = false;
  next.panels.storyFilterPeekOpen = false;
}

function optionsRouteEventId(eventIds, step) {
  if (!Array.isArray(eventIds) || eventIds.length === 0) return null;
  return eventIds[Math.max(0, Math.min(eventIds.length - 1, step))] || null;
}
