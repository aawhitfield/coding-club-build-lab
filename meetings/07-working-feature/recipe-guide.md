# Recipe Guide · Choose one working feature

The recipes are matched pairs. Copy the HTML controls and the JavaScript pattern for the same recipe. Do not mix IDs from different recipes until the first one works.

## Random chooser

HTML:

```html
<button id="choose-button" type="button">Choose for me</button>
<p id="result-message" class="message" hidden>Result appears here.</p>
```

JavaScript: use `recipes/random-chooser.js`.

Normal test: click twice and check that a result appears. Edge test: ask whether an empty list would have a result, then explain why this recipe does not use an input.

## Topic message

HTML:

```html
<label>Topic <input id="topic-input" type="text"></label>
<button id="message-button" type="button">Make a next step</button>
<p id="result-message" class="message" hidden>Result appears here.</p>
```

JavaScript: use `recipes/input-to-message.js`. It uses a fictional topic, not a student name or personal data.

Normal test: type a topic. Edge test: leave it blank and confirm the helpful message appears.

## Checklist

HTML needs a checkbox with `id="done-input"`, a button with `id="check-button"`, and a result element with `id="result-message"`. JavaScript: use `recipes/checklist.js`.

Normal test: check the box and press the button. Edge test: leave it unchecked.

## Counter

HTML needs buttons with `id="add-button"` and `id="reset-button"`, plus a result element with `id="count-message"`. JavaScript: use `recipes/counter.js`.

Normal test: add twice. Edge test: reset, then explain what changed.

## Calculator

HTML needs `first-number`, `second-number`, `calculate-button`, and `result-message`. JavaScript: use `recipes/simple-calculator.js`.

Normal test: enter two numbers. Edge test: leave one blank and explain the validation message.

## Stuck ladder

1. Compare each HTML ID with the JavaScript comment.
2. Run the normal case and observe what did or did not change.
3. Run the edge case and read the console message.
4. Restore only the affected file from the starter.
5. Ask a peer, teacher, or optional AI adviser for one diagnosis—not a rewrite.
