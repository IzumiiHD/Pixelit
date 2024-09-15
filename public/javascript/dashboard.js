const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

function addSpinClickListener() {
  const spinButton = document.getElementById('spin');
  const tokensDisplay = document.getElementById('tokens');
  const countdownDisplay = document.createElement('span');
  spinButton.parentNode.insertBefore(countdownDisplay, spinButton.nextSibling);
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  function updateCountdown() {
    const currentTime = Date.now();
    const lastSpinTime = parseInt(localStorage.getItem('lastSpinTime') || '0');
    const timeLeft = Math.max(0, TWO_HOURS - (currentTime - lastSpinTime));

    if (timeLeft > 0) {
      const secondsLeft = Math.ceil(timeLeft / 1000);
      countdownDisplay.textContent = ` Next spin in ${secondsLeft} seconds`;
      spinButton.disabled = true;
      spinButton.style.display = 'none';
      setTimeout(updateCountdown, 1000);
    } else {
      countdownDisplay.textContent = '';
      spinButton.disabled = false;
      spinButton.style.display = 'inline-block';
    }
  }

  updateCountdown();

  spinButton.addEventListener('click', async () => {
    const currentTime = Date.now();
    const lastSpinTime = parseInt(localStorage.getItem('lastSpinTime') || '0');

    if (currentTime - lastSpinTime < TWO_HOURS) {
      return;
    }

    const tokensWon = Math.floor(Math.pow(Math.random(), 2.5) * 6) * 100 + 500;

    try {
      const response = await fetch('/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: tokensWon })
      });

      const data = await response.json();

      if (data.message === "Spin successful") {
        const newTokens = parseInt(tokensDisplay.textContent) + tokensWon;
        tokensDisplay.textContent = newTokens;
        alert(`Congratulations! You won ${tokensWon} tokens!`);

        localStorage.setItem('lastSpinTime', currentTime.toString());
        updateCountdown();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred while spinning.");
    }
  });
}

addSpinClickListener();


window.onload = () => {
  //document.body.style.pointerEvents = "none";
  fetch("/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json(); // Parse JSON data
      } else if (response.status === 500) {
        return response.text().then((text) => {
          alert(text);
        });
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
        ge("role").style.background = "url('/img/rainbow.gif')";
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