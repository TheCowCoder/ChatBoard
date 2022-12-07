const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const res = require("express/lib/response");

const Utils = require("./classes/Utils.js");
const Player = require("./classes/Player");
const Room = require("./classes/Room.js");


const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static("public"));


io.on("connection", (socket) => {
    console.log("A user connected!", socket.id);
    let player;

    socket.on("login", (username, callback) => {
        console.log(socket.id, "logging in", username);

        player = new Player(socket);
        player.username = username;

        console.log("created player");

        return callback({
            success: true
        });
    });


    socket.on("createRoom", (callback) => {
        if (!player) return callback({
            success: false,
            reason: "Please wait a bit before creating a room."
        });
        if (player.room) return callback({
            success: false,
            reason: "Please leave the room you're in before creating a new one."
        });
        

        const room = new Room(player);
        console.log("Created and joined room", room);


        return callback({
            success: true,
            us: player.getForClient()
        });
    });


    socket.on("joinRoom", (roomId, callback) => {
        if (!player) return callback({
            success: false,
            reason: "Please wait a bit before joining a room."
        });
        if (player.room) return callback({
            success: false,
            reason: "Please leave the room you're in before joining another one."
        });
        
        console.log(player.username, "joining room", roomId);

        const room = Room.rooms[roomId];

        if (!room) return callback({
            success: false,
            reason: "Room not found."
        });


        player.joinRoom(room);
        console.log("they joined the room", room);

        return callback({
            success: true,
            us: player.getForClient()
        });
    });

    socket.on("leaveRoom", (callback) => {
        if (!player) return callback({
            success: false,
            reason: "Please wait a bit before leaving a room."
        });


        if (!player.room) return callback({
            success: false,
            reason: "You aren't in a room!"
        });
        
        console.log(player.username, "leaving room");

        player.leaveRoom();

        console.log("they left the room");

        console.log("ROOMIDS NOW:", Object.keys(Room.rooms));

        return callback({
            success: true,
            us: player.getForClient()
        });
    });


    socket.on("sendMsg", (msg, callback) => {
        if (!player) return callback({
            success: false,
            reason: "Please wait a bit before sending a message."
        });

        if (!player.room) return callback({
            success: false,
            reason: "You aren't in a room."
        });

        console.log("Msg sending!", msg, player.username);

        player.data.msg = msg;

        player.room.emit("event", "sendMsg", {
            us: "getForClient"
        });

        return callback({
            success: true,
            us: player.getForClient()
        });
    })


    socket.on("disconnecting", () => {
        console.log(socket.id, player, "disconnecting");
        
        if (player) player.delete();
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected!", socket.id);
    });
});


server.listen(PORT, () => {
    console.log("Listening on port", PORT);
});
