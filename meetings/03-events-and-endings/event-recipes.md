# Event Recipes

## Reveal a panel

```js
onClick("secret-button", function () {
  show("secret-panel");
  hide("normal-panel");
});
```

Replace the IDs with IDs that exist in your HTML.

## Change text

```js
onClick("message-button", function () {
  setText("message", "Your new message goes here.");
});
```

## Builder: choose an ending

```js
var brave = false;

onClick("brave-button", function () {
  brave = true;
  if (brave) {
    show("brave-ending");
  }
});
```
