require('./util');

class Room{
    constructor(roomName, creator){
        this.name = roomName;
        this.fullName = roomName + "#" + getRandomInt(1, 1000);
        this.creator = creator;
        this.playerMap = {};
        this.roomCode = randSeedStr(new Date().getTime() + "::salt::room", 32);
    }

    join = (newPlayer) => {
        this.playerMap[newPlayer.playerCode] = newPlayer;
    }
}

class Player{
    constructor(nickname){
        this.nickname = nickname;
        this.socket = null;
        this.playerCode = randSeedStr(new Date().getTime() + "::salt::player", 16);
    }

    openSocket = () => {
        this.socket = require('socket.io').listen(80);
        this.socket.on("connection", socket => {
            console.log("connected!");
        });
    }
}

module.exports = {Room, Player};