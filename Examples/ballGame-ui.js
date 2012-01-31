/*!
* RtsJs
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/

/*
* This file contains logic handling drawing and inputs
*/
var ballGameUi = {};
ballGameUi.create = function (gameLogic, canvas, gameCommandCreatedCallback) {
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
        var x = event.pageX - this.offsetLeft;
        var y = event.pageY - this.offsetTop;
        var action = ballGameLogic.createAction(x, y);
        gameCommandCreatedCallback(action);
    });

    var clearScreen = function () {
        preCtx.fillStyle = "#333";
        preCtx.fillRect(0, 0, self.screenWidth, self.screenHeight);
    };

    return {
        draw: function () {
            // Clear screen
            clearScreen();

            // Draw all balls
            var balls = gameLogic.getBalls();
            var ballId;
            var ball;

            preCtx.beginPath();
            preCtx.fillStyle = "#000";
            for (ballId in balls) {
                ball = balls[ballId];
                preCtx.arc(ball.x + 2, ball.y + 2, ball.radius + 2, 0, Math.PI * 2);
            }
            preCtx.closePath();
            preCtx.fill();

            preCtx.beginPath();
            preCtx.fillStyle = "#FFF";
            for (ballId in balls) {
                ball = balls[ballId];
                preCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            }
            preCtx.closePath();
            preCtx.fill();

            // Apply prerender
            self.ctx.drawImage(preRenderCanvas, 0, 0);
        }
    };
}