// Required HTML: buttons with ids="add-button" and "reset-button" and a result
// element with id="count-message".
var count = 0;
function updateCount() { setText("count-message", "Completed: " + count); }
onClick("add-button", function () { count += 1; updateCount(); });
onClick("reset-button", function () { count = 0; updateCount(); });
updateCount();
