const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

ge("spin").addEventListener("click", () => {
  /*const tokenValues = [500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000];
  const randomIndex = Math.floor(Math.random() * tokenValues.length);
  const tokensWon = tokenValues[randomIndex];
  user.tokens += tokensWon;*/
  tokens.innerHTML = user.tokens;
  alert(`Congratulations! You claimed ${tokensWon} tokens!`);
});

// Function to render badges
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

// Initialize the user object
const user = {
  username: "username",
  uid: 0,
  tokens: 0,
  packs: [],
  pfp: "/img/blooks/logo.png",
  banner: "/img/banner/defaultBanner.svg",
  badges: [],
  role: "Common",
  spinned: 0,
  stats: { sent: 0, packsOpened: 0 },
};

// Get references to DOM elements
const username = ge("username");
const tokens = ge("tokens");
const sent = ge("messages");
const spin = ge("spin");
const packsOpened = ge("packs");

// Fetch user data from the server
fetch("/user")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
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
    ge("pfp").src = `/img/blooks/${user.pfp}`;
    ge("pfp").onerror = function () { this.src = "/img/blooks/logo.png"; }
    ge("banner").src = `/img/banner/${user.banner}`;
    ge("role").innerHTML = user.role;
    const usernameElement = ge("username");
    usernameElement.innerHTML = user.username;
    if (user.role === "Owner") {
        usernameElement.style.background = "url('/img/rainbow.gif')";
        usernameElement.style.backgroundClip = "text";
        usernameElement.style.webkitBackgroundClip = "text";
        usernameElement.style.color = "transparent";
    }
    if (user.role === "Owner") {
        ge("role").style.background = "url('/img/rainbow.gif')";
        ge("role").style.backgroundClip = "text";
        ge("role").style.webkitBackgroundClip = "text";
        ge("role").style.color = "transparent";
    }
    renderBadges(user.badges);
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });

// Welcome message based on session
if (sessionStorage.loggedin == "true") {
  username.innerHTML = " " + sessionStorage.username;
  updateTokens();
} else {
}

// Display current date and time
const today = new Date();
const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};
date.innerHTML = today.toLocaleDateString("en-US", dateOptions);

// Function to update tokens
function updateTokens() {
  socket.emit("getTokens", sessionStorage.username);
}

// Socket event listeners for real-time updates
socket.on("tokens", (tokensr, sentr, packsOpenedr) => {
  tokens.innerHTML = tokensr;
  sent.innerHTML = sentr;
  packsOpened.innerHTML = packsOpenedr;
});

socket.emit("getUserBadges", sessionStorage.username);

socket.on("getUserBadges", (badges) => {
  if (badges === "get") {
    socket.emit("getUserBadges", sessionStorage.username);
    return;
  }
  console.log(badges);
  renderBadges(badges);
});

ge("banner").parentElement.addEventListener("click", () => {
  if (user.role === "Common") {
    alert("You do not have permission to change your banner.");
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