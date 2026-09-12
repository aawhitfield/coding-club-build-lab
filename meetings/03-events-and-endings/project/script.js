// BUILD LAB EDIT 6: replace the possibilities in both lists. Keep the commas and quotation marks.
var actions = [
  "Interview a vending machine",
  "Organize a tiny parade",
  "Teach a pigeon to use a planner",
  "Start a club for people who dislike clubs",
  "Challenge the school mascot to a debate"
];

var complications = [
  "while wearing oven mitts",
  "before the next bell rings",
  "with only three dramatic sound effects",
  "under the supervision of a very serious squirrel",
  "without letting anyone know why"
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
