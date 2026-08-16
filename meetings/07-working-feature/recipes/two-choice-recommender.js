// Required HTML: a select with id="choice-input", a button with id="recommend-button",
// and a result element with id="result-message".
onClick("recommend-button", function () {
  var choice = valueOf("choice-input");
  var recommendation = choice === "focus" ? "Try one ten-minute task." : "Take a short movement break.";
  setText("result-message", recommendation);
  show("result-message");
});
