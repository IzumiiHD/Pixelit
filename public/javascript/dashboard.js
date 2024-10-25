const socket = io();

function ge(id) {
  return document.getElementById(id);
}

function initializeUserSession() {
  if (localStorage.loggedin === "true") {
    sessionStorage.loggedIn = 'true';
    sessionStorage.username = localStorage.username;
  }

  if (sessionStorage.loggedIn !== 'true') {
    window.location.href = '/login.html';
    return;
  }
}

window.onload = () => {
  initializeUserSession();

  fetch("/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => {
      if (response.ok) return response.json();
      throw new Error(`Unexpected status code: ${response.status}`);
    })
    .then(data => updateUserInterface(data))
    .catch(error => handleFetchError(error));
};

function updateUserInterface(data) {
  const user = parseUserData(data);
  updateDOMElements(user);
  renderBadges(user.badges);
  setupRoleBasedUI(user.role);
}

function handleFetchError(error) {
  console.error("There was a problem with the fetch operation:", error);
  sessionStorage.clear();
  window.location.href = '/login.html';
}

function parseUserData(data) {
  return {
    username: data.username || 'Guest',
    tokens: data.tokens || 0,
    uid: data.uid || 0,
    packs: data.packs || [],
    pfp: data.pfp || '/img/blooks/logo.png',
    banner: data.banner || '/img/banner/defaultBanner.svg',
    badges: data.badges || [],
    role: data.role || 'Common',
    spinned: data.spinned || 0,
    stats: data.stats || { sent: 0, packsOpened: 0 },
  };
}

function updateDOMElements(user) {
  ge('username').textContent = user.username;
  ge('tokens').textContent = formatNumber(user.tokens);
  ge('messages').textContent = formatNumber(user.stats.sent);
  ge('packs').textContent = formatNumber(user.stats.packsOpened);
  ge('pfp').src = `/img/blooks/${user.pfp}`;
  ge('pfp').onerror = () => this.src = "/img/blooks/logo.png";
  ge('banner').src = `/img/banner/${user.banner}`;
  ge('role').textContent = user.role;
}

function setupRoleBasedUI(role) {
  const roleColors = {
    'Owner': ['url("/img/dashboard/rainbow.gif")', 'transparent'],
    'Plus': ['blue'],
    'Tester': ['#24e2d8'],
    'Helper': ['#1973a0'],
    'Moderator': ['#bb1bc7'],
    'Admin': ['#bd0404']
  };

  if (role in roleColors) {
    const [color, textColor] = roleColors[role];
    ge("username").style.color = color;
    ge("role").style.color = color;
    if (textColor) {
      ge("username").style.background = color;
      ge("role").style.background = color;
      ge("username").style.webkitBackgroundClip = 'text';
      ge("role").style.webkitBackgroundClip = 'text';
      ge("username").style.color = textColor;
      ge("role").style.color = textColor;
    }
  }
}

function renderBadges(badges) {
  const badgeContainer = ge("badges");
  badgeContainer.style.display = "block";
  badgeContainer.innerHTML = '';
  badges.forEach(badge => {
    const badgeElement = document.createElement("div");
    badgeElement.classList.add("badge");
    badgeElement.innerHTML = `<img src="${badge.image}" alt="${badge.name}">`;
    badgeContainer.appendChild(badgeElement);
  });
}

function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}


// Our socket setup for the Dashboard

if (sessionStorage.loggedIn === "true") {
  socket.emit("getTokens", sessionStorage.username);

  socket.on("tokens", (tokensr, sentr, packsOpenedr) => {
    ge('tokens').textContent = formatNumber(tokensr);
    ge('messages').textContent = formatNumber(sentr);
    ge('packs').textContent = formatNumber(packsOpenedr);
  });

  socket.emit("getUserBadges", sessionStorage.username);

  socket.on("getUserBadges", renderBadges);
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/user')
    .then(response => response.json())
    .then(data => {
      const userRole = data.role;
      const allowedRoles = ['Owner', 'Admin', 'Moderator', 'Helper'];
      if (allowedRoles.includes(userRole)) {
        ge("wrench-icon").style.display = 'inline';
      }
    })
    .catch(error => {
      console.error('Error fetching user role:', error);
    });
});