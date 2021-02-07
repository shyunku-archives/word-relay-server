const axios = require('axios');
const util = require('./util');
const socketio = require('socket.io', {transports: ["websocket"]})(24991);

class Room{
    constructor(roomName, creator){
        this.name = roomName;
        this.fullName = roomName + "#" + util.getRandomInt(1000);
        this.creator = creator;
        this.playerQueue = [];
        this.playerMap = {};
        this.socketMap = {};
        this.closed = false;
        this.usedWordHashMap = {};

        this.join(this.creator);

        this.roomCode = util.randSeedStr(new Date().getTime() + "::salt::room", 32);
        this.rounding = false;

        this.socketServer = socketio.of("/" + this.roomCode);

        this.socketServer.on("connection", socket => {
            console.log("client connected to room " + this.name);

            socket.on("auth", data => {
                for(let i=0;i<this.playerQueue.length; i++){
                    let cursorPlayer = this.playerQueue[i];

                    if(cursorPlayer.playerCode === data.playerCode){
                        this.playerMap[socket.id] = {
                            player: cursorPlayer,
                            score: 0,
                            playing: !this.rounding
                        };

                        this.socketMap[socket.id] = socket;

                        socket.emit("auth", true);
                        return;
                    }
                }
                socket.emit("auth", false);
            });

            socket.on("initialFetch", data => {
                let playingMap = {};
                let watchingMap = {};
                for(let playerCode in this.playerMap){
                    let player = this.playerMap[playerCode];
                    if(player.playing){
                        playingMap[playerCode] = player;
                    }else{
                        watchingMap[playerCode] = player;
                    }
                }

                socket.emit("initialFetch", {
                    roomName: this.name,
                    roomFullName: this.fullName,
                    playingMap: playingMap,
                    watchingMap: watchingMap
                });
            });

            socket.on("message", data => {
                let sender = this.playerMap[socket.id].player;

                this.socketServer.emit("message", {
                    sender: sender,
                    content: data,
                    time: new Date().getTime()
                });
            });

            socket.on("relay", data => {
                let sender = this.playerMap[socket.id].player;

                axios.get(`http://localhost/dict/meaning?query=${data}`)
                    .then(res => {
                        let searchResult = res.data;
                        let matched = searchResult.totalResultNum > 0;
                        let available = false;

                        if(matched){
                            if(!this.usedWordHashMap.hasOwnProperty(searchResult)){
                                this.usedWordHashMap[data] = true;
                                available = true;

                                sender.score += 1;

                                this.socketServer.emit("relay-broadcast", {
                                    sender: sender,
                                    word: data,
                                    meanings: searchResult.meanings,
                                });
                            }
                        }

                        this.socketServer.emit("relay", {
                            sender: sender,
                            matched: matched,
                            available: available,
                            word: searchResult.targetWord,
                            time: new Date().getTime()
                        });
                    })
                    .catch(res => {

                    });
            });

            socket.on("disconnect", data => {
                let leftPlayerCode = this.playerMap[socket.id].player.playerCode;
                let isCreatorLeft = leftPlayerCode === this.creator.playerCode;

                this.socketServer.emit("leave", leftPlayerCode);
                delete this.playerMap[socket.id];
                delete this.socketMap[socket.id];

                let isRoomEmpty = Object.keys(this.playerMap).length === 0;
                
                if(isRoomEmpty){
                    console.log("room closed.");
                    return;
                }

                if(isCreatorLeft){
                    this.socketServer.emit("creatorLeft");
                    this.closeRoom();
                    return;
                }
            });
        });

        Room.prototype.toJSON = () => {
            return {
                name: this.name,
                fullName: this.fullName,
                creator: this.creator,
                playerMap: this.playerMap,
                roomCode: this.roomCode,
                closed: this.closed,
                playerQueue: this.playerQueue
            }
        }
    }

    join = (newPlayer) => {
        this.playerQueue.push(newPlayer);
    }

    closeRoom = () => {
        for(let sid in this.playerMap){
            this.socketMap[sid].disconnect(true);
        }
    }
}

class Player{
    constructor(nickname){
        this.nickname = nickname;
        this.playerCode = util.randSeedStr(new Date().getTime() + "::salt::player", 16);
    }
}

module.exports = {Room, Player};