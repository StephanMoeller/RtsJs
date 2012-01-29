/*!
* RtsJs
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/

/*
* This file contains logic handling drawing and inputs
*/
var ballGameUi = {};
ballGameUi.create = function (gameLogic, canvas, actionCreatedCallback) {
    var self = {};
    self.ctx = canvas.getContext('2d');
    self.screenWidth = canvas.width;
    self.screenHeight = canvas.height;
    self.actionCreatedCallback = actionCreatedCallback;

    // Setup input listening and action creation here
    var jqueryCanvas = $("#" + canvas.id);
    jqueryCanvas.click(function (event) {
        var x = event.pageX - this.offsetLeft;
        var y = event.pageY - this.offsetTop;
        var action = ballGameLogic.createAction(x, y);
        actionCreatedCallback(action);
    });

    return {
        draw: function () {
            self.ctx.clearRect(0, 0, self.screenWidth, self.screenHeight);
            var balls = gameLogic.getBalls();
            for (var ballId in balls) {
                var ball = balls[ballId];
                self.ctx.beginPath();
                self.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                self.ctx.closePath();
                self.ctx.fill();
            }
        }
    };
}