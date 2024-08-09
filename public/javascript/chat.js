function ge(id) {
  return document.getElementById(id);
}

const socket = io()

function createMessageHTML(message) {
    return `
        <div class="message">
            <div class="pfp">
                <img
                    src="${message.user.pfp}"
                    alt="pfp"
                    draggable="false"
                    style="filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))"
                />
            </div>
            <div class="messageContainer">
                <div class="usernameAndBadges">
                    <div class="username">${message.user.username}</div>
                    <div class="badges">
                        <img
                            src="${message.user.badge}"
                            draggable="false"
                            class="badge"
                        />
                    </div>
                </div>
                <div class="messageText">${message.messageText}</div>
            </div>
        </div>
    `;
}

console.log("Chat has been successfully loaded!");

ge("send").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements[0].value;
  fetch("/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ msg }),
  }).then((response) => {
    if (response.status === 200) {
      console.log();
    } else if (response.status === 500) {
      return response.text().then((text) => {
        alert(text);
      });
    } else {
      console.error("Unexpected response status:", response.status);
    }
  });
  e.target.elements[0].value = "";
});
