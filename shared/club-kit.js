// Coding Club helper library.
// Beginners use these small functions first; advanced students may inspect
// this file to see how the browser DOM works underneath.
(function (global) {
  "use strict";

  function find(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`[Club Kit] Could not find an element with id "${id}".`);
    }
    return element;
  }

  function onClick(id, action) {
    const element = find(id);
    if (!element || typeof action !== "function") return;
    element.addEventListener("click", action);
  }

  function show(id) {
    const element = find(id);
    if (element) element.hidden = false;
  }

  function hide(id) {
    const element = find(id);
    if (element) element.hidden = true;
  }

  function setText(id, text) {
    const element = find(id);
    if (element) element.textContent = String(text);
  }

  function valueOf(id) {
    const element = find(id);
    return element ? element.value : "";
  }

  function pickRandom(items) {
    if (!Array.isArray(items) || items.length === 0) return undefined;
    return items[Math.floor(Math.random() * items.length)];
  }

  function addClass(id, className) {
    const element = find(id);
    if (element) element.classList.add(className);
  }

  function removeClass(id, className) {
    const element = find(id);
    if (element) element.classList.remove(className);
  }

  Object.assign(global, { onClick, show, hide, setText, valueOf, pickRandom, addClass, removeClass });
})(window);
