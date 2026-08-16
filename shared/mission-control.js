(function () {
  "use strict";

  const configElement = document.getElementById("mission-config");
  if (!configElement) return;

  let config;
  try {
    config = JSON.parse(configElement.textContent);
  } catch {
    return;
  }

  const iframe = document.getElementById("project-preview");
  const previewFrame = document.querySelector(".preview-frame");
  const status = document.querySelector("[data-preview-status]");
  const missionStatus = document.querySelector("[data-mission-status]");
  const fullPreview = document.querySelector("[data-full-preview]");
  const pathLabel = document.querySelector("[data-edit-path]");
  const fileTree = document.querySelector("[data-file-tree]");
  const copyPathButtons = [...document.querySelectorAll("[data-copy-path]")];
  const previewLabel = document.querySelector("[data-preview-label]");
  const trackButtons = [...document.querySelectorAll("[data-track-target]")];
  const progressBoxes = [...document.querySelectorAll("input[data-progress]")];
  const progressFill = document.querySelector("[data-progress-fill]");
  const progressLabel = document.querySelector("[data-progress-label]");
  const storagePrefix = `coding-club:${config.id}`;

  let track = config.defaultTrack || Object.keys(config.tracks)[0];
  let lastVersion = null;
  let pollingTimer;
  let pollFailures = 0;

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Progress is an enhancement. The lesson remains usable if storage is blocked.
    }
  }

  function setStatus(message, state) {
    if (status) {
      status.textContent = message;
      status.dataset.state = state || "";
    }
    if (missionStatus) missionStatus.textContent = message;
  }

  function currentTrack() {
    return config.tracks[track] || config.tracks[config.defaultTrack];
  }

  function previewUrl(cacheBust) {
    const url = new URL(currentTrack().preview, window.location.href);
    if (cacheBust) url.searchParams.set("mission_preview", String(Date.now()));
    return url;
  }

  function updateTrackContent() {
    document.querySelectorAll("[data-track-only]").forEach((element) => {
      const visible = element.dataset.trackOnly === track;
      element.classList.toggle("is-hidden", !visible);
      element.hidden = !visible;
    });
    trackButtons.forEach((button) => {
      const selected = button.dataset.trackTarget === track;
      button.setAttribute("aria-pressed", String(selected));
    });
    const target = currentTrack();
    const firstFile = `${config.pathPrefix || ""}${target.editFiles?.[0] || target.preview}`;
    if (pathLabel) pathLabel.textContent = firstFile;
    copyPathButtons.forEach((button) => { button.dataset.copyPath = firstFile; });
    if (fileTree) {
      const folder = track === "catchUp" ? "catch-up" : "project";
      fileTree.textContent = `meetings/\n  01-ridiculous-website/\n    ${folder}/\n      index.html   ← start here\n      style.css\n      script.js`;
    }
    if (previewLabel) previewLabel.textContent = track === "catchUp" ? "Catch-up project" : "Team project";
    if (fullPreview) fullPreview.href = previewUrl().toString();
  }

  function loadPreview(cacheBust) {
    if (!iframe) return;
    const url = previewUrl(cacheBust);
    iframe.src = url.toString();
    if (fullPreview) fullPreview.href = previewUrl().toString();
    setStatus("Loading preview…");
  }

  function selectTrack(nextTrack) {
    if (!config.tracks[nextTrack]) return;
    track = nextTrack;
    writeStorage(`${storagePrefix}:track`, track);
    lastVersion = null;
    updateTrackContent();
    restoreProgress();
    loadPreview(false);
  }

  async function pollVersion() {
    const target = currentTrack();
    if (!target.watchPath) return;
    try {
      const watchPath = `${config.pathPrefix || ""}${target.watchPath}`;
      const response = await fetch(`/__version?path=${encodeURIComponent(watchPath)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Version check failed");
      const payload = await response.json();
      pollFailures = 0;
      if (lastVersion === null) {
        lastVersion = payload.version;
      } else if (payload.version !== lastVersion) {
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
    const completed = progressBoxes.filter((box) => box.checked).length;
    const total = progressBoxes.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${completed} of ${total} checkpoints complete`;
    const selected = progressBoxes.filter((box) => box.checked).map((box) => box.dataset.progress);
    writeStorage(`${storagePrefix}:${track}:progress`, selected);
    document.querySelectorAll("[data-baseline-state]").forEach((element) => {
      const required = [...document.querySelectorAll("input[data-baseline-required]")];
      const done = required.length > 0 && required.every((box) => box.checked);
      element.textContent = done ? "Baseline working · choose a level-up" : "Complete the guided baseline first";
      element.dataset.state = done ? "ready" : "waiting";
    });
  }

  function restoreProgress() {
    const selected = new Set(readStorage(`${storagePrefix}:${track}:progress`, []));
    progressBoxes.forEach((box) => {
      box.checked = selected.has(box.dataset.progress);
    });
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
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(succeeded).catch(() => setStatus("Select the path and press Ctrl+C", "warning"));
      return;
    }
    setStatus("Select the path and press Ctrl+C", "warning");
  }

  function openHashStep() {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (target?.tagName === "DETAILS") target.open = true;
  }

  track = readStorage(`${storagePrefix}:track`, track);
  if (!config.tracks[track]) track = config.defaultTrack;
  trackButtons.forEach((button) => button.addEventListener("click", () => selectTrack(button.dataset.trackTarget)));
  document.querySelectorAll("[data-reload-preview]").forEach((button) => button.addEventListener("click", () => loadPreview(true)));
  copyPathButtons.forEach((button) => button.addEventListener("click", () => copyPath(button)));
  progressBoxes.forEach((box) => box.addEventListener("change", updateProgress));
  document.querySelectorAll("[data-prediction-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest("[data-prediction-group]");
      if (!group) return;
      const correct = button.dataset.predictionChoice === group.dataset.answer;
      group.querySelectorAll("[data-prediction-choice]").forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));
      button.classList.add(correct ? "is-correct" : "is-wrong");
      const feedback = group.querySelector("[data-prediction-feedback]");
      if (feedback) feedback.textContent = correct ? "Correct. Now explain why." : "Not quite. Look at the file names and try again.";
    });
  });
  iframe?.addEventListener("load", () => setStatus("Preview ready · save code to see it update"));

  updateTrackContent();
  restoreProgress();
  loadPreview(false);
  openHashStep();
  window.addEventListener("hashchange", openHashStep);
  pollVersion();
  pollingTimer = window.setInterval(pollVersion, 1000);
  window.addEventListener("beforeunload", () => window.clearInterval(pollingTimer));
})();
