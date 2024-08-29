const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

ge("spin").addEventListener("click", () => {
  const now = new Date().getTime();
  const oneHour = 60 * 60 * 1000;
  const lastSpinTime = localStorage.getItem('lastSpinTime');
  if (lastSpinTime && (now - lastSpinTime < oneHour)) {
    const remainingTime = Math.ceil((oneHour - (now - lastSpinTime)) / 60000);
    alert(`You have already claimed your tokens, please wait ${remainingTime} minutes to claim it again.`);
    return;
  }
  localStorage.setItem('lastSpinTime', now);
  const tokensWon = Math.floor(Math.pow(Math.random(), 2.5) * 6) * 100 + 500;
  user.tokens += tokensWon;
  tokens.innerHTML = user.tokens;
  alert(`Congratulations!, You claimed ${tokensWon} tokens!`);
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
      usernameElement.style.color = "#710879";
      ge("role").style.color = "#710879";

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
  if (user.role !== "Common") {
    const overlayDiv = document.createElement("div");
    overlayDiv.classList.add("banner-selection-overlay");
    overlayDiv.style.display = "flex";
    overlayDiv.style.justifyContent = "center";
    overlayDiv.style.alignItems = "center";
    overlayDiv.style.position = "fixed";
    overlayDiv.style.top = "0";
    overlayDiv.style.left = "0";
    overlayDiv.style.width = "100%";
    overlayDiv.style.height = "100%";
    overlayDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";

    const bannerSelectionDiv = document.createElement("div");
    bannerSelectionDiv.classList.add("banner-selection-content");
    bannerSelectionDiv.style.backgroundColor = "#fff";
    bannerSelectionDiv.style.padding = "30px";
    bannerSelectionDiv.style.borderRadius = "5px";
    bannerSelectionDiv.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.5)";

    const images = ["chocolate.svg", "clockwork.svg", "fire.svg", "outerSpace.svg"];
    images.forEach((image) => {
      const imgElement = document.createElement("img");
      imgElement.src = `/img/banner/${image}`;
      imgElement.classList.add("banner-image");
      imgElement.style.width = "150px";
      imgElement.style.height = "150px";
      imgElement.style.display = "inline-block";
      imgElement.style.cursor = "pointer";
      imgElement.addEventListener("click", () => {
        user.banner = image;
        ge("banner").src = `/img/banner/${image}`;
        document.body.removeChild(overlayDiv);
      });
      bannerSelectionDiv.appendChild(imgElement);
    });

    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(overlayDiv);
    });
    bannerSelectionDiv.appendChild(cancelButton);

    overlayDiv.appendChild(bannerSelectionDiv);
    document.body.appendChild(overlayDiv);
  }
    // Save the newly selected banner to the database
    fetch('/updateBanner', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username, banner: user.banner }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Failed to update banner.');
        } else {
            alert('Banner updated successfully!');
        }
    })
    .catch(error => {
        console.error('Error updating banner:', error);
        alert('An error occurred while updating the banner.');
    });
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