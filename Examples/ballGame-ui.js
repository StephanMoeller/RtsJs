var ballGameDrawing = {};
ballGameDrawing.create = function (gameLogic, canvas) {
    var self = {};
    self.ctx = canvas.getContext('2d');
    self.screenWidth = canvas.width;
    self.screenHeight = canvas.height;
    return {
        draw: function () {
            self.ctx.clearRect(0, 0, self.screenWidth, self.screenHeight);
            var balls = gameLogic.getBalls();
            for (ballId in balls) {
                var ball = balls[ballId];
                self.ctx.beginPath();
                self.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                self.ctx.closePath();
                self.ctx.fill();
            }
        }
    };
}