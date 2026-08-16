// Required HTML: an input with id="name-input", a button with id="message-button",
// and a result element with id="result-message".
onClick("message-button", function () {
  var name = valueOf("name-input").trim();
  setText("result-message", name ? "Welcome, " + name + "!" : "Please type a name first.");
  show("result-message");
});
