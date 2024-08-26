function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function parseMessage(str) {
    const safe_str = escapeHTML(str); // remove all HTML tags from the message (leaves just plaintext and markdown)
    const parsed = marked.parse(safe_str); // parse markdown into HTML
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
                    draggable="false"
                    style="filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))"
                    onerror="this.src='/img/blooks/logo.png';"
                />
            </div>
            <div class="messageContainer">
                <div class="usernameAndBadges">
                    <div class="username">${username}</div>
                    <div class="badges">
                        ${badgesHTML}
                    </div>
                </div>
                <div class="messageText">${parseMessage(message.msg)}</div>
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