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
let localMessageIds = new Set();
let messageQueue = [];
let isSending = false;

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
        if (!localMessageIds.has(message._id)) {
            const messageHTML = document.createElement('div');
            messageHTML.innerHTML = createMessageHTML(message);
            fragment.appendChild(messageHTML);
            localMessageIds.add(message._id);
        }
    });
    messagesContainer.appendChild(fragment);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Utility to get byte size of a string
const byte = (str) => new Blob([str]).size;

async function sendMessageFromQueue() {
    if (isSending || messageQueue.length === 0) return;

    isSending = true;
    const msg = messageQueue.shift();

    try {
        await socket.emit("message", msg);
        // Wait for server confirmation before sending next message
        setTimeout(sendMessageFromQueue, 100);
    } catch (error) {
        console.error("Error sending message:", error);
        messageQueue.unshift(msg); // Put the message back in the queue
    } finally {
        isSending = false;
    }
}

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    console.log("Chat has been successfully loaded!");

    const debouncedSendMessage = debounce(() => {
        const input = ge("send");
        const msg = input.value.trim();
        if (msg === "" || byte(msg) > 1000) return;

        messageQueue.push(msg);
        sendMessageFromQueue();

        input.value = "";
    }, 300);

    // Handle send message action
    ge("send").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            debouncedSendMessage();
        }
    });

    // Initial fetch of chat messages
    socket.emit("getChat");

    socket.on("chatupdate", (data) => {
        if (data === "get") {
            socket.emit("getChat");
            return;
        }
        const newMessages = data.filter(msg => !localMessageIds.has(msg._id));
        messages = messages.concat(newMessages);
        updateMessages(newMessages);
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