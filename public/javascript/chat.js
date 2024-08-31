// Utility function to escape HTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Parse and sanitize the message
function parseMessage(str) {
    const safeStr = escapeHTML(str); // remove all HTML tags from the message (leaves just plaintext and markdown)
    const parsed = marked.parse(safeStr); // parse markdown into HTML
    const sanitized = DOMPurify.sanitize(parsed); // remove any unsafe HTML tags from parsed markdown
    return sanitized;
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

//--------------------------Functions-------------------------------------------

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
function updateMessages(messages) {
    const messagesContainer = ge("chatContainer");
    const fragment = document.createDocumentFragment();

    messages.forEach(message => {
        const messageHTML = document.createElement('div');
        messageHTML.innerHTML = createMessageHTML(message);
        fragment.appendChild(messageHTML);
    });

    messagesContainer.innerHTML = ""; // Clear existing content
    messagesContainer.appendChild(fragment); // Append batched updates
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
}

// Utility to get byte size of a string
const byte = (str) => new Blob([str]).size;

//------------------------Socket io handlers-----------------------------------

// Handle send message action
ge("send").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const msg = e.target.value.trim();
        if (msg === "") {
            e.target.value = "";
            return;
        }
        if (byte(msg) > 1000) {
            alert("Message is too long!");
            e.target.value = "";
            return;
        }
        const chatMessage = { sender: username, msg, badges, pfp };
        messages.push(chatMessage);
        updateMessages(messages);
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

    // Create a set of existing message ids to prevent duplicate messages
    const existingMessagesSet = new Set(messages.map(msg => msg._id));

    // Check if there are new messages
    if (JSON.stringify(data) !== JSON.stringify(messages)) {
        // Filter out duplicate messages
        data = data.filter(msg => !existingMessagesSet.has(msg._id));
        messages = messages.concat(data);
        updateMessages(messages);
    }
});

document.addEventListener('DOMContentLoaded', function() {
  fetch('/user')  // Adjust this to your actual API endpoint
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