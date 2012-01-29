var ballGameLogic = {};
// Utils/helper functions with no side effects
ballGameLogic.utils = {
    checkColliding : function (ball1, ball2) {
        return ballGameLogic.utils.getDistance(ball1, ball2) < ball1.radius + ball2.radius;
    },
    getDirection : function (p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    },
    getDistance : function (p1, p2) {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    },
    getBallSpeed : function (ball) {
        return Math.sqrt(ball.xForce * ball.xForce + ball.yForce * ball.yForce);
    },
    setDirectionAndSpeedOnBall : function (ball, direction, speed) {
        ball.xForce = Math.cos(direction) * speed;
        ball.yForce = Math.sin(direction) * speed;
    },
    resolveCollision : function (ball1, ball2) {
        var direction = ballGameLogic.utils.getDirection(ball1, ball2);
        var totalSpeed = ballGameLogic.utils.getBallSpeed(ball1) + ballGameLogic.utils.getBallSpeed(ball2);
        var speedForEach = totalSpeed / 2;
        ballGameLogic.utils.setDirectionAndSpeedOnBall(ball1, direction + Math.PI, speedForEach);
        ballGameLogic.utils.setDirectionAndSpeedOnBall(ball2, direction, speedForEach);
    }
};
ballGameLogic.createAction = function (mouseX, mouseY) {
    return { x: mouseX, y: mouseY };
};
ballGameLogic.create = function () {
    var self = {};
    var utils = ballGameLogic.utils;
    self.width = 300;
    self.height = 300;
    self.balls = {};
    self.allActions = []; // A collections of all actions applied to the game using the tick function. Enables replay.
    // Init balls
    (function () {
        for (var i = 0; i < 10; i++) {
            var ballId = "ball_" + i;
            self.balls[ballId] = { radius: 10 + i * 1, x: 20 + 25 * i, y: 20 + 25 * i, xForce: 0, yForce: 0 };
        }
    })();

    self.applyPush = function (ball, mouseX, mouseY) {
        var distance = utils.getDistance({ x: mouseX, y: mouseY }, ball);
        if (distance > 100)
            return;
        if (distance < 10)
            distance = 10;
        var force = 100 / distance * 4;
        var direction = utils.getDirection({ x: mouseX, y: mouseY }, ball);
        ball.xForce += Math.cos(direction) * force;
        ball.yForce += Math.sin(direction) * force;
    };

    return {
        getBalls: function () {
            return self.balls;
        },
        getAllActions: function () {
            return self.allActions;
        },
        tick: function (actionArray) {
            self.allActions.push(actionArray); // Used for replays only

            var ball;
            var ballId;

            var balls = self.balls;
            // Apply all actions
            for (var i = 0; i < actionArray.length; i++) {
                var action = actionArray[i];
                console.log("Applying action:");
                console.log(action);
                for (ballId in balls) {
                    ball = balls[ballId];
                    self.applyPush(ball, action.x, action.y);
                }
            }

            for (ballId in balls) {
                ball = balls[ballId];

                // Move ball
                ball.x += ball.xForce;
                ball.y += ball.yForce;

                // Check collisions with other balls
                for (var otherId in balls) {
                    if (ballId === otherId)
                        continue;

                    var otherBall = balls[otherId];

                    if (utils.checkColliding(ball, otherBall)) {
                        utils.resolveCollision(ball, otherBall);
                    }
                }

                // Check collisions with walls
                if (ball.x > self.width - ball.radius && ball.xForce > 0)
                    ball.xForce = -ball.xForce;
                if (ball.x < ball.radius && ball.xForce < 0)
                    ball.xForce = -ball.xForce;

                if (ball.y < ball.radius && ball.yForce < 0)
                    ball.yForce = -ball.yForce;
                if (ball.y > self.height - ball.radius && ball.yForce > 0)
                    ball.yForce = -ball.yForce;

                // Reduce speed
                ball.xForce = ball.xForce * 0.95;
                ball.yForce = ball.yForce * 0.95;
            }
        }
    };
}