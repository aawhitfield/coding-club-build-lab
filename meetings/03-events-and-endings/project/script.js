// BUILD LAB EDIT 4: keep the button ID matched with index.html.
onClick("secret-button", function () {
  show("secret-panel");
  hide("normal-panel");
});

onClick("reset-button", function () {
  hide("secret-panel");
  show("normal-panel");
});
