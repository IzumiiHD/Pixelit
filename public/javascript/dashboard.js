const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

// Define the possibleTokens Array and spins Function
const possibleTokens = [500, 600, 700, 800, 900, 1000];
const ONE_HOUR = 60 * 60 * 1000; // One hour in milliseconds

function spins() {
  const user = getUserFromSession(); // Retrieve user data from session/local storage
  const now = Date.now();

  if (!user || typeof user.tokens !== 'number') { // Ensure user and tokens are valid
    console.error("Invalid user data or tokens");
    return;
  }

  if (user.lastSpinTime && (now - user.lastSpinTime) < ONE_HOUR) {
    const timeLeft = Math.ceil((ONE_HOUR - (now - user.lastSpinTime)) / 1000 / 60);
    alert(`You can spin again in ${timeLeft} minute(s).`);
    return;
  }

  // Perform token claiming logic if the user is allowed to spin
  const earnedTokens = possibleTokens[Math.floor(Math.random() * possibleTokens.length)];
  user.tokens = (user.tokens || 0) + earnedTokens;
  user.spinned = (user.spinned || 0) + 1;
  user.lastSpinTime = now;

  updateUserInSession(user); // Update the user data in session/local storage

  console.log("User data after spin:", user); // Debugging log

  // Update the UI
  document.getElementById('tokens').innerText = user.tokens;
  alert(`You have earned ${earnedTokens} tokens!`);
}

// Helper functions
function getUserFromSession() {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log("User data retrieved from storage:", user); // Debugging log
  return user || { tokens: 0, spinned: 0 }; // Ensure valid user object with default values
}

function updateUserInSession(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Event listener for the spin button
document.getElementById('spin').addEventListener('click', spins);

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