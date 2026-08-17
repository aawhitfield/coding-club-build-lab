(function () {
  "use strict";

  const configElement = document.getElementById("mission-config");
  if (!configElement) return;

  let config;
  try { config = JSON.parse(configElement.textContent); } catch { return; }

  const iframe = document.getElementById("project-preview");
  const previewFrame = document.querySelector(".preview-frame");
  const previewPanel = document.querySelector(".preview-panel");
  const externalPanel = document.querySelector("[data-external-preview]");
  const status = document.querySelector("[data-preview-status]");
  const missionStatus = document.querySelector("[data-mission-status]");
  const fullPreview = document.querySelector("[data-full-preview]");
  const externalLink = document.querySelector("[data-external-link]");
  const externalPath = document.querySelector("[data-external-path]");
  const pathLabel = document.querySelector("[data-edit-path]");
  const fileTree = document.querySelector("[data-file-tree]");
  const copyPathButtons = [...document.querySelectorAll("[data-copy-path]")];
  const previewLabel = document.querySelector("[data-preview-label]");
  const trackButtons = [...document.querySelectorAll("[data-track-target]")];
  const progressBoxes = [...document.querySelectorAll("input[data-progress]")];
  const progressFill = document.querySelector("[data-progress-fill]");
  const progressLabel = document.querySelector("[data-progress-label]");
  const storagePrefix = `coding-club:${config.id}`;

  let track = config.defaultTrack || Object.keys(config.tracks || {})[0];
  let lastVersion = null;
  let pollingTimer;
  let pollFailures = 0;

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch { return fallback; }
  }

  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* enhancement only */ }
  }

  function setStatus(message, state) {
    if (status) { status.textContent = message; status.dataset.state = state || ""; }
    if (missionStatus) missionStatus.textContent = message;
  }

  function currentTrack() {
    return config.tracks?.[track] || config.tracks?.[config.defaultTrack] || {};
  }

  function currentMode() { return currentTrack().mode || config.mode || "embedded"; }

  function previewUrl(cacheBust) {
    const url = new URL(currentTrack().preview || "", window.location.href);
    if (cacheBust) url.searchParams.set("mission_preview", String(Date.now()));
    return url;
  }

  function activeProgressBoxes() {
    return progressBoxes.filter((box) => {
      const owner = box.closest("[data-track-only]");
      return !owner || owner.dataset.trackOnly === track;
    });
  }

  function updateTrackContent() {
    document.querySelectorAll("[data-track-only]").forEach((element) => {
      const visible = element.dataset.trackOnly === track;
      element.classList.toggle("is-hidden", !visible);
      element.hidden = !visible;
    });
    trackButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.trackTarget === track)));

    const target = currentTrack();
    const firstFile = target.editFiles?.[0] || target.preview || "";
    const prefix = target.pathPrefix ?? config.pathPrefix ?? "";
    const displayPath = target.displayPath || (firstFile.startsWith(prefix) ? firstFile : `${prefix}${firstFile}`);
    if (pathLabel) pathLabel.textContent = displayPath;
    copyPathButtons.forEach((button) => { button.dataset.copyPath = displayPath; });
    if (fileTree) fileTree.textContent = target.fileTree || target.editFiles?.join("\n") || displayPath;
    if (previewLabel) previewLabel.textContent = target.label || (track === "catchUp" ? "Catch-up project" : "Team project");
    if (fullPreview) fullPreview.href = previewUrl().toString();
    if (externalLink) externalLink.href = target.externalUrl || "#";
    if (externalPath) externalPath.textContent = target.externalPath || displayPath;

    const external = currentMode() === "external";
    if (iframe) iframe.hidden = external;
    if (previewFrame) previewFrame.hidden = external;
    if (previewPanel) previewPanel.classList.toggle("is-external", external);
    if (externalPanel) externalPanel.hidden = !external;
    if (fullPreview) fullPreview.hidden = external;
    if (external) setStatus(target.status || "Open the external editor, run after each small change, and save a backup.");
  }

  function loadPreview(cacheBust) {
    if (currentMode() === "external") {
      setStatus(currentTrack().status || "Open the external editor, run after each small change, and save a backup.");
      return;
    }
    if (!iframe) return;
    iframe.src = previewUrl(cacheBust).toString();
    if (fullPreview) fullPreview.href = previewUrl().toString();
    setStatus("Loading preview…");
  }

  function selectTrack(nextTrack) {
    if (!config.tracks?.[nextTrack]) return;
    track = nextTrack;
    writeStorage(`${storagePrefix}:track`, track);
    lastVersion = null;
    pollFailures = 0;
    updateTrackContent();
    restoreProgress();
    loadPreview(false);
  }

  async function pollVersion() {
    const target = currentTrack();
    if (currentMode() === "external" || !target.watchPath) return;
    try {
      const prefix = target.pathPrefix ?? config.pathPrefix ?? "";
      const response = await fetch(`/__version?path=${encodeURIComponent(`${prefix}${target.watchPath}`)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Version check failed");
      const payload = await response.json();
      pollFailures = 0;
      if (lastVersion === null) lastVersion = payload.version;
      else if (payload.version !== lastVersion) {
        lastVersion = payload.version;
        previewFrame?.classList.remove("is-updated");
        void previewFrame?.offsetWidth;
        previewFrame?.classList.add("is-updated");
        loadPreview(true);
        setStatus(`Updated just now · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}`, "updated");
      }
    } catch {
      pollFailures += 1;
      if (pollFailures === 3) setStatus("Auto-refresh paused · use Reload Preview", "warning");
    }
  }

  function updateProgress() {
    const active = activeProgressBoxes();
    const completed = active.filter((box) => box.checked).length;
    const total = active.length;
    if (progressFill) progressFill.style.width = `${total ? Math.round((completed / total) * 100) : 0}%`;
    if (progressLabel) progressLabel.textContent = `${completed} of ${total} checkpoints complete`;
    writeStorage(`${storagePrefix}:${track}:progress`, active.filter((box) => box.checked).map((box) => box.dataset.progress));
    document.querySelectorAll("[data-baseline-state]").forEach((element) => {
      const required = active.filter((box) => box.hasAttribute("data-baseline-required"));
      const done = required.length > 0 && required.every((box) => box.checked);
      element.textContent = done ? "Baseline working · choose a level-up" : "Complete the guided baseline first";
      element.dataset.state = done ? "ready" : "waiting";
    });
  }

  function restoreProgress() {
    const selected = new Set(readStorage(`${storagePrefix}:${track}:progress`, []));
    progressBoxes.forEach((box) => { box.checked = selected.has(box.dataset.progress); });
    updateProgress();
  }

  function copyPath(button) {
    const text = button.dataset.copyPath || pathLabel?.textContent || "";
    const succeeded = () => {
      const previous = button.textContent;
      button.textContent = "Copied";
      setStatus("Path copied · switch to the Codespace tab and press Ctrl+P", "updated");
      window.setTimeout(() => { button.textContent = previous; }, 1400);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(succeeded).catch(() => setStatus("Select the path and press Ctrl+C", "warning"));
    else setStatus("Select the path and press Ctrl+C", "warning");
  }

  function openHashStep() {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (target?.tagName === "DETAILS") target.open = true;
  }

  track = readStorage(`${storagePrefix}:track`, track);
  if (!config.tracks?.[track]) track = config.defaultTrack;
  trackButtons.forEach((button) => button.addEventListener("click", () => selectTrack(button.dataset.trackTarget)));
  document.querySelectorAll("[data-reload-preview]").forEach((button) => button.addEventListener("click", () => loadPreview(true)));
  copyPathButtons.forEach((button) => button.addEventListener("click", () => copyPath(button)));
  progressBoxes.forEach((box) => box.addEventListener("change", updateProgress));
  document.querySelectorAll("[data-prediction-choice]").forEach((button) => button.addEventListener("click", () => {
    const group = button.closest("[data-prediction-group]");
    if (!group) return;
    const correct = button.dataset.predictionChoice === group.dataset.answer;
    group.querySelectorAll("[data-prediction-choice]").forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));
    button.classList.add(correct ? "is-correct" : "is-wrong");
    const feedback = group.querySelector("[data-prediction-feedback]");
    if (feedback) feedback.textContent = correct ? (group.dataset.success || "Correct. Use the clue to explain why.") : `Not quite. ${group.dataset.hint || "Read the clues and try again."}`;
  }));
  iframe?.addEventListener("load", () => {
    const bodyText = iframe.contentDocument?.body?.textContent?.trim() || "";
    if (bodyText === "Not found" || bodyText === "Forbidden") {
      setStatus("Preview file missing · switch tracks or use Open Full Preview", "warning");
      return;
    }
    // Keep the more useful "Updated" announcement visible after the refreshed
    // iframe finishes loading; ordinary first loads still report readiness.
    if (status?.dataset.state !== "updated") setStatus("Preview ready · save code to see it update");
  });

  updateTrackContent();
  restoreProgress();
  loadPreview(false);
  openHashStep();
  window.addEventListener("hashchange", openHashStep);
  pollVersion();
  pollingTimer = window.setInterval(pollVersion, 1000);
  window.addEventListener("beforeunload", () => window.clearInterval(pollingTimer));
})();
