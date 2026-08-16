function goTo(screenId) {
  ["home-screen", "tool-screen", "about-screen"].forEach(function (id) { hide(id); });
  show(screenId);
}
onClick("start-button", function () { goTo("tool-screen"); });
onClick("about-button", function () { goTo("about-screen"); });
onClick("home-button", function () { goTo("home-screen"); hide("result-message"); });
onClick("about-home-button", function () { goTo("home-screen"); });
onClick("result-button", function () {
  var choice = valueOf("choice-input");
  setText("result-message", choice === "focus" ? "Try one ten-minute task." : "Take a short movement break.");
  show("result-message");
});
