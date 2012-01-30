/*!]
* RtsJs - rtsClient
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/

// data contains: username, groupId, totalUserCount, callbackStart, callbackTick, callbackLag
var rtsClient = { };
rtsClient.create = function (data) {
    var inputActionArrayBuffer = {};
    var outputActionArrayBuffer = [];

    var currentNetworkTurn = 0;
    var futureExecutionStepDelay = 2; // The gap to be between next input and next output

    // Initialize input buffer with ampty entries
    for (var i = 0; i < futureExecutionStepDelay; i++) {
        inputActionArrayBuffer[i] = [];
    }

    var doNetworkTurn = function () {
        // Check if next input is missing
        var nextArrayToProcess = inputActionArrayBuffer[currentNetworkTurn];
        if (nextArrayToProcess === undefined) {
            data.callbackLag();
            return;
        }

        // Send next output
        now.serverAddActions(currentNetworkTurn + futureExecutionStepDelay, outputActionArrayBuffer);

        // Process next input
        data.callbackTick(nextArrayToProcess);

        // Count up tick number and erase output buffer
        currentNetworkTurn++;
        outputActionArrayBuffer = [];

        updateDebugInfo();
    };

    now.clientStart = function () {
        data.callbackStart();
        setInterval(doNetworkTurn, 40);
    };

    // Called by the server with fixed intervals. This is the way the server synchronizes the clients.
    now.clientAddActions = function (turn, actionArray) {
        if (inputActionArrayBuffer[turn] !== undefined)
            throw "Client has already received data with tick number " + turn;
        inputActionArrayBuffer[turn] = actionArray;
    };

    // Call the serverJoinGroup function on the server when now is set up
    now.ready(function () {
        now.serverJoinGroup(data.username, data.groupId, data.totalUserCount);
    });

    // Notify log info
    var updateDebugInfo = function () {
        if (data.callbackDebug !== undefined) {
            var highestReceivedTurn = currentNetworkTurn;
            while (inputActionArrayBuffer[highestReceivedTurn] !== undefined)
                highestReceivedTurn++;

            var bufferSize = highestReceivedTurn - currentNetworkTurn;
            var lag = inputActionArrayBuffer[currentNetworkTurn] === undefined;
            data.callbackDebug({
                targetGap: futureExecutionStepDelay, // The desired gap between the processed tick number and the next sent tick number from the client to the server
                bufferSize: bufferSize,
                lag: lag,
                currentNetworkTurn: currentNetworkTurn
            });
        }
    };
    
    return {
        addData: function (action) {
            // Tells the server to add the specified data to the next data array sent by the server to all clients.
            outputActionArrayBuffer.push(action);
        }
    };
};