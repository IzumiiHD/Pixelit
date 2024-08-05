const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}
function renderBadges(badges) {
  const badgeContainer = ge("badges");
  badgeContainer.style.display = "block";
  badges.forEach((badge) => {
    const badgeElement = document.createElement("div");
    badgeElement.classList.add("badge");
    badgeElement.innerHTML = `<img class="badge" src="${badge.image}" alt="${badge.name}">`;
    badgeContainer.appendChild(badgeElement);
  });
}
const user = {'username': 'username', 'uid': 0, 'tokens': 0, 'packs': [], 'pfp': '/img/blooks/logo.png','banner': '/img/banner/defaultBanner.svg', 'badges': [], 'role': 'Common','spinned': 0,'stats': {'sent':0,'packsOpened': 0}}
const username = ge("username");
const tokens = ge("tokens");
const sent = ge("messages");
const spin = ge("spin");
const packsOpened = ge("packs");
fetch("/user")
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }
  return response.json();
})
.then(data => {
  user.username = data.username;
  user.uid = data.uid;
  user.tokens = data.tokens;
  user.packs = data.packs;
  user.pfp = data.pfp;
  user.banner = data.banner;
  user.badges = data.badges;
  user.role = data.role;
  user.spinned = data.spinned;
  user.stats = data.stats;
  username.innerHTML = user.username;
  tokens.innerHTML = user.tokens;
  sent.innerHTML = user.stats.sent;
  packsOpened.innerHTML = user.stats.packsOpened;
  ge("pfp").src = `../img/blooks/${user.pfp}`;
  ge("banner").src = `../img/banner/${user.banner}`;
  ge("role").innerHTML = user.role;
  ge("username").innerHTML = user.username
  renderBadges(user.badges)
})
.catch(error => {
  console.error('There was a problem with the fetch operation:', error);
});
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