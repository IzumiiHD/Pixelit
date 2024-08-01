/*function ge(id) {
  return document.getElementById(id);
}

const socket = io();
let chatMessages;

window.onload = () => {
  socket.emit("getChat");
}

function decrypt(text, pass) {
  var decrypted = CryptoJS.AES.decrypt(text, pass).toString(CryptoJS.enc.Utf8);
  return decrypted
}

// Get the container where you want to append the chat messages
const chatContainer = document.getElementById("chat-box");
const content = ge("sendcont");
const send = ge("send")

// Iterate through the chatMessages object
function renderChats() {
  chatContainer.innerHTML = "";
  for (let key = 0; key < chatMessages.length; key++) {
    console.log(chatMessages[key])
    //if (chatMessages.hasOwnProperty(key)) {
      // Create the message container div
      var messageContainer = document.createElement("div");
      if (chatMessages[key].sender == sessionStorage.username) {
        messageContainer.classList.add("message", "outgoing");
      } else {
        messageContainer.classList.add("message", "incoming");
      }

      var sender = document.createElement("span");
      sender.innerHTML = "Username: " + chatMessages[key].sender;
      sender.classList.add("username")
      
      // Create the message content div
      var messageContent = document.createElement("div");
      messageContent.classList.add("message-content");

      // Create the paragraph element for the message text
      var messageText = document.createElement("p");
      messageText.textContent = decrypt(chatMessages[key].message, "chat");

      // Create the timestamp span element
      var timestamp = document.createElement("span");
      timestamp.classList.add("timestamp");
      timestamp.textContent = chatMessages[key].timestamp;

      // Append message text and timestamp to message content
      messageContent.appendChild(sender)
      messageContent.appendChild(messageText);
      messageContent.appendChild(timestamp);

      // Append message content to message container
      messageContainer.appendChild(messageContent);

      // Append message container to the chat container
      chatContainer.appendChild(messageContainer);

      chatContainer.scrollTop = chatContainer.scrollHeight;
    //}
  }
}

socket.on("chatupdate", (chat) => {
  if (chat === "get") {
    socket.emit("getChat");
    return
  }
  chatMessages = chat;
  renderChats();
})

function sendm(e) {
  e.preventDefault()
  if (content.value.trim() == "") return
  socket.emit("message", sessionStorage.username, content.value)
  content.value = ""
}

send.addEventListener("click", (e) => {
  sendm(e)
})
*/
const socket = io();
function get(id) {
  return document.getElementById(id);
}
