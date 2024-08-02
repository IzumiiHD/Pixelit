function ge(id) {
  return document.getElementById(id)
}

const socket = io()

const toenc = ge("toenc")
const key = ge("key")
const enc = ge("enc")
const encrypted = ge("encrypted")

const todec = ge("todec")
const keyd = ge("keyd")
const dec = ge("dec")
const decrypted = ge("decrypted")

function encrypt(text, pass) {
   var encrypted = CryptoJS.AES.encrypt(text, pass);
   return encrypted
}

function decrypt(text, pass) {
  var decrypted = CryptoJS.AES.decrypt(text, pass).toString(CryptoJS.enc.Utf8);
  return decrypted
}

enc.onclick = () => {
  encrypted.value = encrypt(toenc.value, key.value)
}
dec.onclick = () => {
  decrypted.value = decrypt(todec.value, keyd.value)
}


let accountRequests

function renderAccountRequests() {
  const container = document.getElementById("requests");
  container.innerHTML = "";
  const header = document.createElement("h2");
  header.textContent = "Account Requests:";
  container.appendChild(header);

  if (Object.keys(accountRequests).length === 0) {
    createNoRequestsDiv(container);
  } else {
    for (const rid in accountRequests) {
      let request = accountRequests[rid];
      const div = document.createElement("div");
      div.classList.add("account-request");

      const usernameDiv = document.createElement("div");
      usernameDiv.classList.add("attribute");
      usernameDiv.innerHTML = `<strong>Username:</strong> ${request.username}`;

      const passwordDiv = document.createElement("div");
      passwordDiv.classList.add("attribute");
      passwordDiv.innerHTML = `<strong>Password:</strong> ${"*".repeat(request.password.length)}`;

      const reasonDiv = document.createElement("div");
      reasonDiv.classList.add("attribute");
      reasonDiv.innerHTML = `<strong>Reason:</strong> ${request.reason}`;

      const acceptButton = document.createElement("button");
      acceptButton.classList.add("button", "accept");
      acceptButton.textContent = "Accept";
      acceptButton.addEventListener("click", () => {
        handleRequest({username: request.username, password: request.password, salt: request.salt}, true);
        socket.emit("getrequests")
      });

      const declineButton = document.createElement("button");
      declineButton.classList.add("button", "decline");
      declineButton.textContent = "Decline";
      declineButton.addEventListener("click", () => {
        handleRequest({username: request.username, password: request.password, salt: request.salt}, false);
        socket.emit("getrequests")
      });

      div.appendChild(usernameDiv);
      div.appendChild(passwordDiv);
      div.appendChild(reasonDiv);
      div.appendChild(acceptButton);
      div.appendChild(declineButton);

      container.appendChild(div);
    }
  }
}

socket.on("requests", (requests) => {
  accountRequests = requests;
  renderAccountRequests();
  console.log(requests)
});


function handleRequest(request, accepted) {
  socket.emit("addAccount", request.username, request.password, request.salt, accepted, {name: sessionStorage.username, pass: sessionStorage.password});
  socket.emit("getrequests")
}

// Function to create the "no account requests found" div
function createNoRequestsDiv(parentDiv) {
  // Create the "no account requests found" div element
  const noRequestsDiv = document.createElement('div');
  noRequestsDiv.textContent = 'No account requests found';
  noRequestsDiv.classList.add('no-requests-message'); // Add CSS class for styling
  parentDiv.appendChild(noRequestsDiv);
}