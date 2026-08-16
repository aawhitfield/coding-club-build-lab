// Required HTML: inputs with ids="first-number" and "second-number", a button
// with id="calculate-button", and a result element with id="result-message".
onClick("calculate-button", function () {
  var first = Number(valueOf("first-number"));
  var second = Number(valueOf("second-number"));
  if (Number.isNaN(first) || Number.isNaN(second)) {
    setText("result-message", "Please enter two numbers.");
  } else {
    setText("result-message", "The sample total is " + (first + second) + ".");
  }
  show("result-message");
});
