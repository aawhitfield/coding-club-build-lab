// BUILD LAB EDIT 4: change the processing rule after the input/output path works.
onClick("recommend-button", function () {
  var choice = valueOf("choice-input");
  var message = choice === "focus"
    ? "Try one ten-minute task."
    : "Take a short movement break.";
  setText("result-message", message);
  show("result-message");
});
