// BUILD LAB EDIT 7: Meeting 3 setup. The lab is hidden during Meeting 2, but the event pattern
// is already safe to run when the team removes the hidden attribute.
onClick("secret-button", function () {
  show("secret-panel");
  hide("normal-panel");
});

onClick("reset-button", function () {
  hide("secret-panel");
  show("normal-panel");
});
