// data contains: username, groupId, totalUserCount, callbackStart, callbackTick, callbackLag
var rtsClient = { };
rtsClient.create = function (data) {

    var dataBuffer = {};
    var currentGameTickNumber = 0;
    var lastAddedGameTickNumber = 0;

    // Fetching the next data array from the buffer and calling the callbackTick function
    var gameTick = function () {
        if (dataBuffer[currentGameTickNumber] === undefined) {
            data.callbackLag();
            return;
        }
        var dataArray = dataBuffer[currentGameTickNumber];
        delete dataBuffer[currentGameTickNumber];
        var currentBufferSize = lastAddedGameTickNumber - currentGameTickNumber;
        data.callbackTick(dataArray, currentGameTickNumber, currentBufferSize);
        currentGameTickNumber++;
    };

    // Called by server when all clients are connected and the game is about to start
    var gameTickRateMs; // Game updates logic every 40 ms - read from server variables
    var gameTickRatesPerDataArray; // The number of game tick rates per time the server sends data to the clients - read from server variables
    now.clientStart = function () {
        gameTickRateMs = now.gameTickRateMs;
        gameTickRatesPerDataArray = now.gameTickRatesPerDataArray;
        setInterval(gameTick, gameTickRateMs);
        data.callbackStart();
    };

    // Called by the server with fixed intervals. This is the way the server synchronizes the clients.
    now.clientAddData = function (gameTickNumber, dataArray) {
        if (dataBuffer[gameTickNumber] !== undefined)
            throw "Client has already received data with tick number " + gameTickNumber;

        // Add data array
        dataBuffer[gameTickNumber] = dataArray; // dataArray might or might not be empty

        // Add empty entries to the buffer as the server won't be able to send data for each game update
        var nextDataGamePosition = gameTickNumber + gameTickRatesPerDataArray;
        gameTickNumber++;
        while (gameTickNumber < nextDataGamePosition) {
            dataBuffer[gameTickNumber] = [];
            gameTickNumber++;
        }

        // For stats purpose only
        lastAddedGameTickNumber = gameTickNumber;
    };

    // Call the serverJoinGroup function on the server when now is set up
    now.ready(function () {
        now.serverJoinGroup(data.username, data.groupId, data.totalUserCount);
    });

    return {
        addData: function (dataToSendToServer) {
            // Tells the server to add the specified data to the next data array sent by the server to all clients.
            now.serverAddToNextDataArray(dataToSendToServer);
        }
    };
};