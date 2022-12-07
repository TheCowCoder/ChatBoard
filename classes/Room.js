const Utils = require("./Utils.js");

class Room {
    static rooms = {};

    static makeRoomId() {
        let roomId = Utils.makeId(4);
        while (roomId in Room.rooms) roomId = Utils.makeId(4);

        return roomId;
    }

    constructor(host) {
        this.roomId = Room.makeRoomId();
        this.players = {};
        
        this.host = host;
        this.host.joinRoom(this);

        this.data = {};

        Room.rooms[this.roomId] = this;
    }

    getForClient() {
        let room = {
            roomId: this.roomId,
            players: {},
            hostId: this.host.socket.id,
            data: this.data
        };
        
        for (const socketId in this.players) {
            const player = this.players[socketId];
            room.players[socketId] = player.getForClient(false);
        }
        
        return room;
    }


    delete() {
        for (const socketId in this.players) {
            this.players[socketId].leaveRoom();
        }
        delete Room.rooms[this.roomId];
    }

    addPlayer(player) {
        this.players[player.socket.id] = player;
        player.room = this;
    }
    removePlayer(player) {
        delete this.players[player.socket.id];
        player.room = null;

        if (Object.keys(this.players).length == 0) {
            this.delete();
            console.log("Last player left, deleting this room.");
        } else {
            if (!(this.host.socket.id in this.players)) {
                console.log("Host has left! Choosing next player to be host.");
                this.host = this.players[Object.keys(this.players)[0]];
            }
        }
    }

    emit(...args) {
        for (const socketId in this.players) {
            const player = this.players[socketId];
            if (args[args.length - 1].us === "getForClient") {
                args[args.length - 1].us = player.getForClient();
            }
            player.emit(...args);
        }
    }
}

module.exports = Room;
