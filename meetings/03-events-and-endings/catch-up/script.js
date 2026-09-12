// BUILD LAB EDIT 6: replace the possibilities in both lists. Keep the commas and quotation marks.
var actions = [
  "Ask a locker for career advice",
  "Start a two-person marching band",
  "Teach a pencil to tell jokes",
  "Invent a new hallway sport",
  "Offer the principal a mysterious coupon"
];

var complications = [
  "with a backpack full of rubber ducks",
  "before anyone asks for the rules",
  "using only interpretive dance",
  "while a bell practices in the background",
  "without saying the letter E"
];

// BUILD LAB EDIT 7: keep the button ID matched with index.html.
onClick("chaos-button", function () {
  var action = pickRandom(actions);
  var complication = pickRandom(complications);

  setText("action-result", action);
  setText("complication-result", complication);
  show("result-card");
});

onClick("reset-button", function () {
  hide("result-card");
  setText("action-result", "Your action will appear here.");
  setText("complication-result", "Your complication will appear here.");
});
