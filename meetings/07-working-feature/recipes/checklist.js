// Required HTML: a button with id="check-button", a checkbox with id="done-input",
// and a result element with id="result-message".
onClick("check-button", function () {
  var done = document.getElementById("done-input").checked;
  setText("result-message", done ? "Nice work. Choose your next small step." : "Choose one task to begin.");
  show("result-message");
});
