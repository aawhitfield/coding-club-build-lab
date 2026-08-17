// Required HTML: an input with id="topic-input", a button with id="message-button",
// and a result element with id="result-message".
onClick("message-button", function () {
  var topic = valueOf("topic-input").trim();
  setText("result-message", topic ? "Your next step for " + topic + " is ready." : "Please type a topic first.");
  show("result-message");
});
