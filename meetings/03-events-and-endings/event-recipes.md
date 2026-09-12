# Chaos Button Recipes

## Two-list generator

Use this after the starter works. Keep the HTML IDs from your project or change them in both files together.

```js
var actions = ["Do a tiny parade", "Interview a locker"];
var complications = ["before the bell", "with oven mitts"];

onClick("chaos-button", function () {
  var action = pickRandom(actions);
  var complication = pickRandom(complications);
  setText("action-result", action);
  setText("complication-result", complication);
  show("result-card");
});
```

## Second category button

Duplicate the working event only after the first button works. Give the second button a new ID and point it at a different list.

## Visual mood

The optional `addClass("result-card", "dramatic")` pattern can change the result card’s appearance. Add the CSS class first, then test the event.

## Stuck ladder

1. Run the machine and describe what did not change.
2. Compare the HTML IDs with the JavaScript strings character by character.
3. Check commas, brackets, quotation marks, and the browser console.
4. Restore only the affected file from `starter/`.
5. Ask a peer, teacher, or optional AI adviser for one diagnosis, not a rewrite.
