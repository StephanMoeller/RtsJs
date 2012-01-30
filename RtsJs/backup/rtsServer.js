/*!
* RtsJs - rtsServer
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/
exports.createServer = function (server) {
    return {
        init: function () {
            var nowjs = require("now");
            var everyone = nowjs.initialize(server);

            // Setup variables accesible from the client
            everyone.now.gameTickRateMs = 40; // Game updates logic every 40 ms
            everyone.now.gameTickRatesPerDataArray = 8; // The number of game tick rates per time the server sends data to the clients

            var serverSendRateMs = everyone.now.gameTickRateMs * (everyone.now.gameTickRatesPerDataArray + 1); // gameTickRateMs * gameTickRatesPerDataArray;

            // Lets the user join a group with a specified groupId.
            // When the group is full (the user count in the group equals the callers value of 'totalUserCount'),
            // The users in the group are all started and an interval function is started, collecting all datas sent from the clients in a buffer,
            // and with specified intervals, sending the data buffer to the clients for the clients to all execute the datas synchroniously.
            everyone.now.serverJoinGroup = function (username, groupId, totalUserCount) {
                // Check if already in a group
                var currentGroupId = this.now.currentGroupId;
                if (currentGroupId !== undefined) {
                    console.log("User already in group " + currentGroupId);
                    return;
                }

                // Check if the game has already been started
                var group = nowjs.getGroup(groupId);
                if (group.started === true) {
                    console.log("user tried to join group " + groupId + ", but group already started.");
                    return;
                }

                console.log("User " + username + " joined group " + groupId + " with total user count " + totalUserCount);

                // Add user to group
                this.now.currentGroupId = groupId;
                this.now.username = username;
                group.addUser(this.user.clientId);

                // Start game if group full
                group.count(function (count) {
                    if (count > totalUserCount) {
                        // This could happen if not al users specify the same totalUserCount
                        console.log("For some odd reason, the total count of group " + count + " exceeds the desired totalUserCount of " + totalUserCount);
                        return;
                    } else if (count === totalUserCount) {
                        group.started = true;
                        console.log("Starting group " + groupId);

                        // Start ticking
                        var serverDataTickNumber = 0;
                        var nextDataArray = [];

                        // Called by server when all clients are connected and the game is about to start
                        group.now.clientStart();

                        // Tells the server to add the specified data to the next data array sent by the server to all clients.
                        group.now.serverAddToNextDataArray = function (data) {
                            nextDataArray.push(data);
                        };

                        var tickFunction = function () {
                            group = nowjs.getGroup(groupId);
                            // Flush the buffer to the clients
                            group.now.clientAddData(serverDataTickNumber, nextDataArray);
                            // Clear the buffer and count up the tick number
                            nextDataArray = [];
                            console.log("Sending ticknumber " + serverDataTickNumber);
                            serverDataTickNumber += everyone.now.gameTickRatesPerDataArray;
                        };
                        setInterval(tickFunction, serverSendRateMs);
                        tickFunction();
                    } else {
                        console.log("Group now has " + count + "/" + totalUserCount + " users");
                    }
                });
            };
        },
        stop: function () {
            server.stop(); // TODO: Find out how to ac1tually stop the server.
        }
    };
};
