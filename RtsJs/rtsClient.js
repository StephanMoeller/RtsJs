/*!]
* RtsJs - rtsClient
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/

// data contains: username, groupId, totalUserCount, callbackStart, callbackTick, callbackLag
var rtsClient = { };
rtsClient.create = function (data) {
    var inputActionArrayBuffer = {}; // Prefilled with an entry on first space
    var outputActionArrayBuffer = []; // Prefilled with an entry on first space

    var currentInputTickNumber = 0;
    var targetGap = 3; // The gap to be between next input and next output
    var gameTicksPerNetworkTick = 3;
    var currentGameTick = 0;

    // Initialize input buffer
    for (var i = 0; i < targetGap; i++) {
        inputActionArrayBuffer[i] = [];
    }

    var tick = function () {
        // Check if next input is missing
        var nextArrayToProcess = inputActionArrayBuffer[currentInputTickNumber];
        if (nextArrayToProcess === undefined) {
            data.callbackLag();
            return;
        }

        // If this is an empty tick, just tick the client
        currentGameTick++;
        if (currentGameTick < gameTicksPerNetworkTick) {
            currentGameTick++;
            data.callbackTick(currentInputTickNumber * gameTicksPerNetworkTick + currentGameTick, []); // This will call tick function with ticks 1, 2, 4, 5, 7, 8
            return;
        }
        currentGameTick = 0;

        // Send next output
        now.serverAddActions(currentInputTickNumber + targetGap, outputActionArrayBuffer);

        // Process next input
        data.callbackTick(currentInputTickNumber * gameTicksPerNetworkTick, nextArrayToProcess); // This will call tick function with tick 0, 3, 6, 9, 12....

        // Count up tick number and erase output buffer
        currentInputTickNumber++;
        outputActionArrayBuffer = [];

        updateDebugInfo();
    };

    // Notify log info
    var updateDebugInfo = function () {
        if (data.callbackDebug !== undefined) {
            var highestReceivedTickNumber = currentInputTickNumber;
            while (inputActionArrayBuffer[highestReceivedTickNumber] !== undefined)
                highestReceivedTickNumber++;

            var bufferSize = highestReceivedTickNumber - currentInputTickNumber;
            var lag = inputActionArrayBuffer[currentInputTickNumber] === undefined;
            data.callbackDebug({
                targetGap: targetGap, // The desired gap between the processed tick number and the next sent tick number from the client to the server
                bufferSize: bufferSize,
                lag: lag,
                currentTickNumber: currentInputTickNumber + currentGameTick
            });
        }
    };

    now.clientStart = function () {
        data.callbackStart();
        setInterval(tick, 40);
    };

    // Called by the server with fixed intervals. This is the way the server synchronizes the clients.
    now.clientAddActions = function (tickNumber, actionArray) {
        if (inputActionArrayBuffer[tickNumber] !== undefined)
            throw "Client has already received data with tick number " + tickNumber;
        inputActionArrayBuffer[tickNumber] = actionArray;
    };

    // Call the serverJoinGroup function on the server when now is set up
    now.ready(function () {
        now.serverJoinGroup(data.username, data.groupId, data.totalUserCount);
    });

    return {
        addData: function (action) {
            // Tells the server to add the specified data to the next data array sent by the server to all clients.
            outputActionArrayBuffer.push(action);
        }
    };
};