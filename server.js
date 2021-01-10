const { response } = require('express');
const express = require('express');
const app = express();
const pbip = require('public-ip');
const {Room, Player} = require('./object');

const server = app.listen(80, async() => {
    publicIp = await pbip.v4();
    console.log(`server opened at ${publicIp}:7900`);
});

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
    next();
});

app.use(express.json());

let roomMap = {};

app.get('/', (req, res) => {
    res.send("It works!");
});

app.get('/roomMap', (req, res) => {
    res.send(roomMap);
});

app.post('/join', (req, res) => {
    let {
        roomCode, nickname
    } = req.query;

    // Room not exist?
    if(!roomMap.hasOwnProperty(roomCode)){
        res.send({
            success: false,
            msg: "Room not exist!",
            data: null
        });
    }

    let room = roomMap[roomCode];

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
    if(!req.body.hasOwnProperty("room_name") || !req.body.hasOwnProperty("creator")){
        res.send({
            success: false,
            msg: "Invalid params",
            data: null
        });
    }

    let roomName = req.body.room_name;
    let creator = req.body.creator;

    let creatorPlayer = new Player(creator);
    let newRoom = new Room(roomName, creatorPlayer);

    roomMap[newRoom.roomCode] = newRoom;

    console.log(`Room ${roomName} created!`);

    res.send({
        success: true,
        msg: null,
        data: {
            player_code: creatorPlayer.playerCode,
            room_code: newRoom.roomCode
        }
    });
});