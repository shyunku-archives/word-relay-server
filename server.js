const express = require('express');
const app = express();
const pbip = require('public-ip');
const {Room, Player} = require('./object');

const server = app.listen(80, async() => {
    publicIp = await pbip.v4();
    console.log(`server opened at ${publicIp}`);
});

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

let roomThreads = {};

app.get('/', (req, res) => {
    res.send("It works!");
});

app.post('/join', (req, res) => {
    let {
        roomCode, nickname
    } = req.query;

    // Room not exist?
    if(!roomThreads.hasOwnProperty(roomCode)){
        res.send({
            success: false,
            msg: "Room not exist!",
            data: null
        });
    }

    let room = roomThreads[roomCode];

    // Player nickname duplicated?
    if(Object.keys(room.playerMap).includes(nickname)){
        res.send({
            success: false,
            msg: "Nickname duplicated!",
            data: null
        });
    }

    let curPlayer = new Player(nickname);
    room.join(curPlayer);

    res.send({
        success: true,
        msg: null,
        data: {
            player_code: curPlayer.playerCode
        }
    });
});

app.post('/createRoom', (req, res) => {
    let roomName = req.query.room_name;
    let newRoom = new Room(roomName, null);

    roomThreads[newRoom.roomCode] = newRoom;

    res.send(true);
});