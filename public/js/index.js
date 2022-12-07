const usernameInp = id("usernameInp");
const loginBtn = id("loginBtn");

const createRoomBtn = id("createRoomBtn");
const joinRoomBtn = id("joinRoomBtn");
const leaveRoomBtn = id("leaveRoomBtn");

const roomIdTxt = id("roomIdTxt");
const playersTxt = id("playersTxt");
const hostIdTxt = id("hostIdTxt");

const playerLst = id("playerLst");
const msgInp = id("msgInp");
const sendBtn = id("sendBtn");


const socketManager = new SocketManager();


createRoomBtn.disabled = true;
joinRoomBtn.disabled = true;
leaveRoomBtn.disabled = true;

msgInp.disabled = true;
sendBtn.disabled = true;


function ezprompt(promptText) {
    let response = prompt(promptText);
    if (response === null) {
        return false;
    }
    response = response.trim();
    if (!response.length) {
        return false;
    }
    return response;
}


loginBtn.addEventListener("click", async (e) => {
    loginBtn.disabled = true;

    const username = usernameInp.value.trim();
    if (!username) {
        alert("Enter a username!");
        loginBtn.disabled = false;
        return;
    }

    console.log("[Index] Logging in with username", username);

    const result = await socketManager.login(username);
    if (!result.success) {
        alert(result.reason);
        loginBtn.disabled = false;
        return;
    }

    usernameInp.disabled = true;
    createRoomBtn.disabled = false;
    joinRoomBtn.disabled = false;
});

joinRoomBtn.addEventListener("click", async (e) => {
    joinRoomBtn.disabled = true;

    const roomId = ezprompt("Enter a room ID:");
    if (!roomId) return joinRoomBtn.disabled = false;
    console.log("[Index] Joining room", roomId);


    const result = await socketManager.joinRoom(roomId);

    console.log("[Index] Joining room result", result);

    if (!result.success) {
        alert(result.reason);
        joinRoomBtn.disabled = false;
        return;
    }

    console.log("[Index] Join room success!");
    console.log(socketManager.player);

    msgInp.disabled = false;
    sendBtn.disabled = false;
    createRoomBtn.disabled = true;
    leaveRoomBtn.disabled = false;

    updateUi();
});

createRoomBtn.addEventListener("click", async (e) => {
    createRoomBtn.disabled = true;

    console.log("[Index] Creating room...");
    const result = await socketManager.createRoom();
    console.log("[Index] Create room result", result);
    console.log(socketManager.player);
    if (!result.success) {
        alert(result.reason);
        createRoomBtn.disabled = false;
        return;
    }

    msgInp.disabled = false;
    sendBtn.disabled = false;
    joinRoomBtn.disabled = true;
    leaveRoomBtn.disabled = false;

    updateUi();
});

leaveRoomBtn.addEventListener("click", async (e) => {
    leaveRoomBtn.disabled = true;
    
    console.log("[Index] Leaving room...");

    const result = await socketManager.leaveRoom();

    if (!result.success) {
        alert(result.reason);
        leaveRoomBtn.disabled = false;
        return;
    }

    leaveRoomBtn.disabled = true;
    createRoomBtn.disabled = false;
    joinRoomBtn.disabled = false;
    msgInp.disabled = true;
    msgInp.value = "";
    sendBtn.disabled = true;


    updateUi();
});

msgInp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});

sendBtn.addEventListener("click", async (e) => {
    const msg = msgInp.value;

    console.log("[Index] Sending msg", msg);

    const result = await socketManager.sendMsg(msg);

    if (!result.success) {
        alert(result.reason);
        return;
    }

    msgInp.value = "";


    console.log("AFTER SEND", socketManager.player.room.players);

    updateUi();
});



function updateUi() {
    // Room info texts
    if (socketManager.player.room) {
        roomIdTxt.innerText = socketManager.player.room.roomId;
        let usernames = [];
        for (const playerId in socketManager.player.room.players) {
            usernames.push(socketManager.player.room.players[playerId].username);
        }
        playersTxt.innerText = usernames.join(", ");
        hostIdTxt.innerText = socketManager.player.room.players[socketManager.player.room.hostId].username;    
    } else {
        roomIdTxt.innerText = "-";
        playersTxt.innerText = "-";
        hostIdTxt.innerText = "-";
    }

    // Players msg list
    playerLst.innerHTML = "";

    if (socketManager.player.room) {
        for (const playerId in socketManager.player.room.players) {
            const player = socketManager.player.room.players[playerId];

            const playerLi = document.createElement("li");

            const playerUsernameTxt = document.createElement("span");
            playerUsernameTxt.classList.add("playerUsernameTxt");
            playerUsernameTxt.innerText = player.username + ": ";

            const playerMsgTxt = document.createElement("span");
            playerMsgTxt.classList.add("playerMsgTxt");
            playerMsgTxt.innerText = player.data.msg || "";

            playerLi.appendChild(playerUsernameTxt);
            playerLi.appendChild(playerMsgTxt);

            // <li><span class="playerUsernameTxt"><strong>Bob:</strong></span> <span class="playerMsgTxt">Hello!</span></li>
            
            playerLst.appendChild(playerLi);
        }
    } else {
        playerLst.innerHTML = '<li><span class="playerUsernameTxt">CowCoder: </span><span class="playerMsgTxt">Make sure to sub!</span></li>';
    }
}



socketManager.addEventListener("playerJoin", (data) => {
    updateUi();
});
socketManager.addEventListener("playerLeave", (data) => {
    updateUi();
});
socketManager.addEventListener("sendMsg", (data) => {
    updateUi();
});
