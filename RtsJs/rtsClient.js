/*!]
* RtsJs - rtsClient
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/
var createEmptyTurnData = function() {
    return {
        systemCommands: [],
        gameCommands: []
    };
};
// data contains: username, groupId, totalUserCount, callbackStart, callbackTick, callbackLag
var rtsClient = { };
rtsClient.create = function (data) {
    var inputTurnBuffer = {}; // key = turn, value = merge turndata object from all players
    var outputTurnBuffer = createEmptyTurnData();

    var currentNetworkTurn = 0;
    var futureExecutionStepDelay = 2; // The gap to be between next input and next output
    var latency = 1; // Number of game turns per network turns. 1 is minimum and means 1 game turn per network turn.
    var remainingEmptyGameTurnsToExecute = 0;

    // Initialize input buffer with ampty entries
    for (var i = 0; i < futureExecutionStepDelay; i++) {
        inputTurnBuffer[i] = createEmptyTurnData();
    }

    var executeNextGameTurn = function () {
        if (remainingEmptyGameTurnsToExecute > 0) {
            // Process empty game commands
            data.callbackTick([]);
            remainingEmptyGameTurnsToExecute--;
            return;
        }

        // Time to execute the next network turn (send next and process new received turn).
        
        // Check if next input is missing
        var turnData = inputTurnBuffer[currentNetworkTurn];
        if (turnData === undefined) {
            data.callbackLag();
            return;
        }

        // Send next output
        now.serverAddTurnData(currentNetworkTurn + futureExecutionStepDelay, outputTurnBuffer);

        // Process system commands
        for (var i = 0; i < turnData.systemCommands.length; i++) {
            var systemCommand = turnData.systemCommands[i];
            console.log("entry " + i);
            console.log(systemCommand);
            if (systemCommand.latency !== undefined) {
                latency = systemCommand.latency;
            }
        }

        // TODO: Notify that latency has changed

        // Process next inputs game data
        data.callbackTick(turnData.gameCommands);

        // Count up tick number and erase output buffer
        currentNetworkTurn++;
        outputTurnBuffer = createEmptyTurnData();
        remainingEmptyGameTurnsToExecute = latency - 1; // Ensures that [latency - 1] number of empty game updates will be executed before handling next network turn
        
        // Debug data
        updateDebugInfo();
    };

    now.clientStart = function () {
        data.callbackStart();
        setInterval(executeNextGameTurn, 40);
    };

    // Called by the server with fixed intervals. This is the way the server synchronizes the clients.
    now.clientAddTurnData = function (turn, turnData) {
        if (inputTurnBuffer[turn] !== undefined)
            throw "Client has already received data with tick number " + turn;
        inputTurnBuffer[turn] = turnData;
    };

    // Call the serverJoinGroup function on the server when now is set up
    now.ready(function () {
        now.serverJoinGroup(data.username, data.groupId, data.totalUserCount);
    });

    // Notify log info
    var updateDebugInfo = function () {
        if (data.callbackDebug !== undefined) {
            var highestReceivedTurn = currentNetworkTurn;
            while (inputTurnBuffer[highestReceivedTurn] !== undefined)
                highestReceivedTurn++;

            var bufferSize = highestReceivedTurn - currentNetworkTurn;
            var lag = inputTurnBuffer[currentNetworkTurn] === undefined;
            data.callbackDebug({
                targetGap: futureExecutionStepDelay, // The desired gap between the processed tick number and the next sent tick number from the client to the server
                bufferSize: bufferSize,
                lag: lag,
                latency: latency,
                currentNetworkTurn: currentNetworkTurn
            });
        }
    };

    return {
        addData: function (action) {
            // Tells the server to add the specified data to the next data array sent by the server to all clients.
            outputTurnBuffer.gameCommands.push(action);
        },
        setLatency: function (newLatency) {
            console.log("Sendeing new latency to server: " + newLatency);
            outputTurnBuffer.systemCommands.push({ latency: newLatency });
        }
    };
};