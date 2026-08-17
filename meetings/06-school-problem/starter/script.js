// BUILD LAB EDIT 5: the screen IDs form the navigation map.
function goTo(screenId) {
  ["home-screen", "tool-screen", "about-screen"].forEach(function (id) {
    hide(id);
  });
  show(screenId);
}
onClick("start-button", function () {
  goTo("tool-screen");
});
onClick("about-button", function () {
  goTo("about-screen");
});
onClick("home-button", function () {
  goTo("home-screen");
  hide("result-message");
});
onClick("about-home-button", function () {
  goTo("home-screen");
});
// Meeting 6 demonstrates a clickable flow. Processing is added in Meeting 7.
onClick("result-button", function () {
  setText("result-message", "Prototype response: the useful result would appear here.");
  show("result-message");
});
