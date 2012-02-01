/*!7
* RtsJs
* Copyright(c) 2012 Stephan Ryer <stephanryer@hotmail.com>
* MIT Licensed
*/

/*
* This file contains the raw game logic without graphics or input logic in it.
*/
var rocketsLogic = {};
// Utils/helper functions with no side effects
rocketsLogic.create = function (ownUsername, allUsernames) {
    if (ownUsername === undefined)
        throw "ownUsername undefined!";
    if (allUsernames === undefined)
        throw "allUsernames undefined!";
    var self = {
        gameCommands: [],
        allUsers: {}
    };

    // Init a user object for each username
    for (var username in allUsernames) {
        self.allUsers[username] = { username: username };
    };

    return {
        tick: function (gameCommandArray) {
            self.gameCommands.push(gameCommandArray);
        },
        ownUsername: function () {
            return ownUsername;
        },
        allUsernames: function () {
            return allUsernames;
        },
        ownUsers: function () {
            return self.users[ownUsername];
        },
        allUsers: function () {
            return self.allUsers;
        },
        getReplay: function () {
            return {
                ownUsername: ownUsername,
                allUsernames: allUsernames,
                gameCommands: self.gameCommands
            };
        }
    };
}