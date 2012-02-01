/*!
* RtsJs
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/

/*
* This file contains logic handling drawing and inputs
*/
var rocketsUi = {};
rocketsUi.create = function (gameLogic, canvas, gameCommandCreatedCallback) {
    var self = {};
    self.ctx = canvas.getContext('2d');
    self.screenWidth = canvas.width;
    self.screenHeight = canvas.height;
    self.gameCommandCreatedCallback = gameCommandCreatedCallback;

    var preRenderCanvas = document.createElement('canvas');
    preRenderCanvas.width = self.screenWidth;
    preRenderCanvas.height = self.screenHeight;
    var preCtx = preRenderCanvas.getContext('2d');

    // Setup input listening and action creation here
    var jqueryCanvas = $("#" + canvas.id);
    jqueryCanvas.click(function (event) {
        //TODO:
        //        var x = event.pageX - this.offsetLeft;
        //        var y = event.pageY - this.offsetTop;
        //        var gameCommand = undefined;
        //        gameCommandCreatedCallback(gameCommand);
    });

    var clearScreen = function () {
        preCtx.fillStyle = "#333";
        preCtx.fillRect(0, 0, self.screenWidth, self.screenHeight);
    };

    return {
        draw: function () {
            // Clear screen
            clearScreen();

            preCtx.font = "bold 12px sans-serif";
            var yPos = self.screenHeight - 12;
            var allUsernames = gameLogic.allUsernames();
            for (var username in allUsernames) {                
                preCtx.fillStyle = username === gameLogic.ownUsername() ? "#FF0":"#FFF";
                preCtx.fillText(username, 10, yPos);
                yPos -= 15;
            }

            // Apply prerender
            self.ctx.drawImage(preRenderCanvas, 0, 0);
        }
    };
}