/*!]
* RtsJs - rtsClient
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/

// data contains: username, groupId, totalUserCount, callbackStart, callbackTick, callbackLag
var rtsClient = { };
rtsClient.create = function (data) {
    var inputActionArrayBuffer = { 0: [], 1: [], 2: [] }; // Prefilled with an entry on first space
    var outputActionArrayBuffer = []; // Prefilled with an entry on first space

    var nextInputTickNumber = 0;
    var targetGap = 3; // The gap to be between next input and next output

    var tick = function () {
        // Check if next input is missing
        var nextArrayToProcess = inputActionArrayBuffer[nextInputTickNumber];
        if (nextArrayToProcess === undefined) {
            data.callbackLag();
            return;
        }
        console.log("Process at " + nextInputTickNumber);

        // Send next output
        now.serverAddActions(nextInputTickNumber + targetGap, outputActionArrayBuffer);

        // Process next input
        data.callbackTick(nextInputTickNumber, nextArrayToProcess);

        // Count up tick number and erase output buffer
        nextInputTickNumber++;
        outputActionArrayBuffer = [];
    };

    now.clientStart = function () {
        data.callbackStart();
        setInterval(tick, 40); // TODO: Bring down network by ticking multiple times per network transmission
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