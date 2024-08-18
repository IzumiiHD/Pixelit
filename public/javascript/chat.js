function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

//----------------------------Variables-----------------------------------------
function ge(id) {
    return document.getElementById(id);
}

const socket = io();

console.log("Chat has been successfully loaded!");

let messages = [];
let users = [
    {
        username: "Pixelit",
        pfp: "/img/blooks/logo.png",
        badges: ["/img/blooks/logo.png", "e"],
    },
];

let username, pfp, badges;

fetch("/user")
    .then((response) => {
        if (!response.ok) {
            throw new Error(
                "Network response was not ok " + response.statusText,
            );
        }
        return response.json();
    })
    .then((data) => {
        username = data.username;
        pfp = data.pfp;
        badges = data.badges;
    })
    .catch((e) => {
        console.error(e);
    });

//--------------------------Functions-------------------------------------------

function createMessageHTML(message) {
    const username = escapeHTML(message.sender);

    const badgesHTML = message.badges
        .map(
            (badge) => `
        <img
            src="${escapeHTML(badge.image)}"
            draggable="false"
            class="badge"
        />
    `,
        )
        .join("");

    return `
        <div class="message">
            <div class="pfp">
                <img
                    src="/img/blooks/${escapeHTML(message.pfp)}"
                    alt="pfp"
                    draggable="false"
                    style="filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))"
                />
            </div>
            <div class="messageContainer">
                <div class="usernameAndBadges">
                    <div class="username">${username}</div>
                    <div class="badges">
                        ${badgesHTML}
                    </div>
                </div>
                <div class="messageText">${escapeHTML(message.msg)}</div>
            </div>
        </div>
    `;
}

function updateMessages(messages) {
    const messagesContainer = ge("chatContainer");
    messagesContainer.innerText = "";

    messages.forEach((message) => {
        const messageHTML = createMessageHTML(message);
        messagesContainer.innerHTML += messageHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

const byte = (str) => {
    let size = new Blob([str]).size;
    return size;
};

//------------------------Socket io thingies-----------------------------------

ge("send").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const msg = e.target.value;
        if (msg.trim() === "") {
            e.target.value = "";
            return;
        }
        if (byte(msg) > 1000) {
            alert("Message is too long!");
            e.target.value = "";
            return;
        }
        const chatmessage = {
            sender: username,
            msg,
            badges: badges,
            pfp: pfp,
        };
        messages.push(chatmessage);
        updateMessages(messages);
        socket.emit("message", msg);
        e.target.value = "";
    }
<<<<<<< HEAD
});

socket.emit("getChat");

socket.on("chatupdate", (data) => {
    if (data === "get") {
        socket.emit("getChat");
        return;
    }
    data.forEach(function (v) {
        delete v._id;
    });
    if (data == messages) {
        console.log("No new messages");
        return;
    }
    messages = data;
    updateMessages(messages);
=======
>>>>>>> 46bd04d (the most up to date version of the pixelit code (git pane fixed))
});

socket.emit("getChat");

socket.on("chatupdate", (data) => {
    if (data === "get") {
        socket.emit("getChat");
        return;
    }
    data.forEach(function (v) {
        delete v._id;
    });
    if (data == messages) {
        console.log("No new messages");
        return;
    }
    messages = data;
    updateMessages(messages);
});