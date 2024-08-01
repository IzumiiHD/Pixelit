const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}
const user = {username: '', tokens: 0, spinned: 0, role: '', packs:[],badges:[], send: 0,packsOpened:0}
const username = ge("username");
const tokens = ge("tokens");
const sent = ge("messages");
const spin = ge("spin");
const packsOpened = ge("packs");
/*
const admins = ["admin" , "IzumiiHD"]

if (admins.includes(sessionStorage.username)) {
  ge("admin").style.display = "block"

}*/

if (sessionStorage.loggedin == "true") {
  username.innerHTML = " " + sessionStorage.username;
  updateTokens();
} else {
  
}
  const today = new Date();
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  date.innerHTML = today.toLocaleDateString('en-US', dateOptions);

function updateTokens() {
  socket.emit("getTokens", sessionStorage.username);
}

function renderBadges(badges) {
  const badgeContainer = ge("badges");
  badges.forEach((badge) => {
    const badgeElement = document.createElement("div");
    badgeElement.classList.add("badge");
    badgeElement.innerHTML = `<img class="badge" src="${badge.image}" alt="${badge.name}">`;
    badgeContainer.appendChild(badgeElement);
  });
}

socket.on("tokens", (tokensr, sentr, packsOpenedr) => {
  tokens.innerHTML = tokensr;
  sent.innerHTML = sentr;
  packsOpened.innerHTML = packsOpenedr;
  //sessionStorage.tokens = res;
});

function spins() {
  //console.log("spinning")
  socket.emit("spin", sessionStorage.username);
}

socket.on("spinned", (gained) => {
  socket.emit("getTokens", sessionStorage.username);
  alert("You gained " + gained + " tokens!");
});

socket.emit("getUserBadges", sessionStorage.username)

socket.on("getUserBadges", (badges) => {
  if (badges === "get") {
    socket.emit("getUserBadges", sessionStorage.username);
    return;
  }
  console.log(badges);
  renderBadges(badges);
});
