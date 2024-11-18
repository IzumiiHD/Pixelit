const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

window.onload = () => {
  fetch("/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json(); 
      } else if (response.status === 500) {
        return response.text().then((text) => {
          alert(text);
        });
      } else if (response.status === 401) {
        sessionStorage.clear();
        window.location.href = "/login.html";
      } else {
        console.error("Unexpected response status:", response.status);
        throw new Error("Unexpected response status");
      }
    })
    .then((data) => {
      document.getElementById("tokens").innerHTML = data.tokens;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};

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

const username = ge("username");
const tokens = ge("tokens");
const sent = ge("messages");
const spin = ge("spin");
const packsOpened = ge("packs");

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
        usernameElement.style.background = "url('/img/dashboard/rainbow.gif')";
        usernameElement.style.backgroundClip = "text";
        usernameElement.style.webkitBackgroundClip = "text";
        usernameElement.style.color = "transparent";
        ge("role").style.background = "url('/img/dashboard/rainbow.gif')";
        ge("role").style.backgroundClip = "text";
        ge("role").style.webkitBackgroundClip = "text";
        ge("role").style.color = "transparent";
    }
    if (user.role === "Plus") {
      usernameElement.style.color = "blue";
      ge("role").style.color = "blue";

    }
    if (user.role === "Tester") {
      usernameElement.style.color = "#24e2d8";
      ge("role").style.color = "#24e2d8";

    }
    if (user.role === "Helper") {
      usernameElement.style.color = "#1973a0";
      ge("role").style.color = "#1973a0";

    }
    if (user.role === "Moderator") {
      usernameElement.style.color = "#bb1bc7";
      ge("role").style.color = "#bb1bc7";

    }
    if (user.role === "Admin") {
      usernameElement.style.color = "#bd0404";
      ge("role").style.color = "#bd0404";

    }
    renderBadges(user.badges);
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });

if (sessionStorage.loggedin == "true") {
  username.innerHTML = " " + sessionStorage.username;
  updateTokens();
} else {
}

function updateTokens() {
  socket.emit("getTokens", sessionStorage.username);
}

function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

socket.on("tokens", (tokensr, sentr, packsOpenedr) => {
  document.getElementById('tokens').textContent = formatNumber(tokensr);
  document.getElementById('messages').textContent = formatNumber(sentr);
  document.getElementById('packs').textContent = formatNumber(packsOpenedr);
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

document.addEventListener('DOMContentLoaded', function() {
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