// Utility function to escape HTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Parse and sanitize the message
function parseMessage(str) {
    const safeStr = escapeHTML(str);
    const parsed = marked.parse(safeStr);
    return DOMPurify.sanitize(parsed);
}

function ge(id) {
    return document.getElementById(id);
}

let messages = [];
let users = [
    {
        username: "Pixelit",
        pfp: "/img/blooks/logo.png",
        badges: ["/img/blooks/logo.png", "e"]
    },
];

let username, pfp, badges;

// Fetch user data
fetch("/user")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
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

// Efficient DOM update for messages
function createMessageHTML(message) {
    const username = escapeHTML(message.sender);
    const badgesHTML = (message.badges || []).map(
        badge => `<img src="${escapeHTML(badge.image)}" draggable="false" class="badge" />`
    ).join("");

    return `
        <div class="message">
            <div class="pfp">
                <img
                    src="/img/blooks/${escapeHTML(message.pfp)}"
                    draggable="false"
                    style="filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))"
                    onerror="this.src='/img/blooks/logo.png';"
                />
            </div>
            <div class="messageContainer">
                <div class="usernameAndBadges">
                    <div class="username">${username}</div>
                    <div class="badges">${badgesHTML}</div>
                </div>
                <div class="messageText">${parseMessage(message.msg)}</div>
            </div>
        </div>
    `;
}

// Batch update messages to reduce reflows
function updateMessages(newMessages) {
    const messagesContainer = ge("chatContainer");
    const fragment = document.createDocumentFragment();

    newMessages.forEach(message => {
        if (!messages.some(m => m._id === message._id)) {
            const messageHTML = document.createElement('div');
            messageHTML.innerHTML = createMessageHTML(message);
            fragment.appendChild(messageHTML);
            messages.push(message);
        }
    });

    messagesContainer.appendChild(fragment);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Utility to get byte size of a string
const byte = (str) => new Blob([str]).size;

document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    console.log("Chat has been successfully loaded!");

    // Handle send message action
    ge("send").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const msg = e.target.value.trim();
            if (msg === "" || byte(msg) > 1000) {
                e.target.value = "";
                return;
            }
            const chatMessage = { sender: username, msg, badges, pfp, _id: Date.now().toString() };
            updateMessages([chatMessage]); // Update locally
            socket.emit("message", msg);
            e.target.value = "";
        }
    });

    // Initial fetch of chat messages
    socket.emit("getChat");

    // Handle chat updates
    socket.on("chatupdate", (data) => {
        if (data === "get") {
            socket.emit("getChat");
            return;
        }

        const newMessages = data.filter(msg => !messages.some(m => m._id === msg._id));
        if (newMessages.length > 0) {
            updateMessages(newMessages);
        }
    });

    fetch('/user')
        .then(response => response.json())
        .then(data => {
            const userRole = data.role;
            const allowedRoles = ['Owner', 'Admin', 'Moderator', 'Helper'];
            if (allowedRoles.includes(userRole)) {
                document.getElementById('wrench-icon').style.display = 'inline';
            }
        })
        .catch(error => {
            console.error('Error fetching user role:', error);
        });
});