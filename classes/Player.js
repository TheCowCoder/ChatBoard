const Utils = require("./Utils.js");

class Player {
    constructor(socket) {
        this.socket = socket;

        this.room = null;
        this.username = "Unnammed cow";

        this.data = {};
    }

    
    getForClient(getFullRoom = true) {
        let player = {
            socketId: this.socket.id,
            username: this.username,
            data: this.data
        };

        if (getFullRoom) {
            player.room = null;
            if (this.room) player.room = this.room.getForClient();
        } else {
            player.roomId = this.room?.roomId || null;
        }

        return player;
    }

    delete() {
        this.leaveRoom();
    }


    joinRoom(room) {
        this.room = room;
        room.addPlayer(this);

        this.broadcast("event", "playerJoin", {
            us: "getForClient"
        });
    }

    leaveRoom() {
        const roomPlayerIds = Object.keys(this.room.players);
        roomPlayerIds.splice(roomPlayerIds.indexOf(this.socket.id), 1);

        let room;
        if (roomPlayerIds.length) room = this.room;

        if (this.room) this.room.removePlayer(this);
        this.room = null;

        for (const roomPlayerId of roomPlayerIds) {
            room.players[roomPlayerId].emit("event", "playerLeave", {
                us: room.players[roomPlayerId].getForClient()
            });
        }
    }


    emit(...args) {
        this.socket.emit(...args);
    }

    broadcast(...args) {
        if (!this.room) return;
        for (const socketId in this.room.players) {
            if (socketId == this.socket.id) continue;
            const player = this.room.players[socketId];

            if (args[args.length - 1].us === "getForClient") {
                args[args.length - 1].us = player.getForClient();
            }
            player.emit(...args);
        }
    }
}

module.exports = Player;
