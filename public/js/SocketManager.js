class SocketManager {
    constructor() {
        this.socket = io({ reconnection: false });

        this.player = null;

        this.socket.on("connect", this.onConnect.bind(this));
        this.socket.on("event", this.receiveEvent.bind(this));

        this.events = {};
    }

    addEventListener(event, callback) {
        this.events[event] = callback;
    }


    // Recieve from server
    onConnect() {
        console.log("[SocketManager] [receive] onConnect");
    }

    receiveEvent(event, data) {
        console.log("[SocketManager] receive", event, data);

        if (data.us) {
            this.player = data.us;
        }

        this["on" + event[0].toUpperCase() + event.slice(1)](data);

        if (this.events[event]) this.events[event](data);
    }
    

    onPlayerJoin(data) {
    }

    onPlayerLeave(data) {
    }

    onSendMsg(data) {
    }

    // Send to server
    sendEvent(event, ...args) {
        return new Promise((resolve) => {
            this.socket.emit(event, ...args, (result) => {
                console.log("[SocketManager] [sent]", event, ...args, result);
                if (!result.success) {
                    console.log("[SocketManager] [ERROR]", event, result.reason);
                }

                if (result.us) {
                    this.player = result.us;
                }
                return resolve(result);
            });
        });
    }

    // Version with advanced reject, meaning u have to catch error
    // sendEvent(event, ...args) {
    //     return new Promise((resolve, reject) => {
    //         this.socket.emit(event, ...args, (result) => {
    //             console.log("[SocketManager] [send]", event, ...args, result);
    //             if (!result.success) {
    //                 console.log("[SocketManager] [ERROR]", event);
    //                 return reject(result);
    //             }

    //             if (result.us) {
    //                 this.player = result.us;
    //             }
    //             return resolve(result);
    //         });
    //     });
    // }


    async login(username) {
        const result = await this.sendEvent("login", username);
        return result;
    }
    
    async startGame() {
        const result = await this.sendEvent("startGame");
        return result;
    }

    async resetGame() {
        const result = await this.sendEvent("resetGame");
        return result;
    }

    async createRoom() {
        const result = await this.sendEvent("createRoom");
        return result;
    }

    async joinRoom(roomId) {
        const result = await this.sendEvent("joinRoom", roomId);
        return result;
    }

    async leaveRoom() {
        const result = await this.sendEvent("leaveRoom");
        return result;
    }

    async sendMsg(msg) {
        const result = await this.sendEvent("sendMsg", msg);
        return result;
    }
}
