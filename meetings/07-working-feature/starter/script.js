var choices = ["Take a ten-minute focus sprint.", "Ask a teammate for one hint.", "Make a tiny first version."];
onClick("choose-button", function () { setText("result-message", pickRandom(choices)); show("result-message"); });
