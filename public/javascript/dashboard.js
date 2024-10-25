const getElement = (id) => document.getElementById(id);

const fetchUserData = async () => {
  try {
    const response = await fetch("/user", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!response.ok) {
      handleErrorResponse(response);
      return;
    }

    const data = await response.json();
    updateUserInterface(data);
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const handleErrorResponse = (response) => {
  if (response.status === 401) {
    console.warn("Unauthorized access. Redirecting to login.");
    sessionStorage.clear();
    window.location.href = "/login.html";
  } else {
    console.error(`Unexpected response: ${response.status} - ${response.statusText}`);
  }
};

const updateUserInterface = (data) => {
  if (!data) return;

  const elements = {
    username: getElement('username'),
    tokens: getElement('tokens'),
    messages: getElement('messages'),
    packs: getElement('packs'),
    pfp: getElement('pfp'),
    banner: getElement('banner'),
    role: getElement('role')
  };

  elements.username.textContent = data.username;
  elements.tokens.textContent = formatLargeNumber(data.tokens);
  elements.messages.textContent = formatLargeNumber(data.stats.sent);
  elements.packs.textContent = formatLargeNumber(data.stats.packsOpened);
  elements.pfp.src = `/img/blooks/${data.pfp}`;
  elements.banner.src = `/img/banner/${data.banner}`;
  elements.role.textContent = data.role;

  elements.pfp.onerror = () => { elements.pfp.src = "/img/blooks/logo.png"; };
  styleUserRole(elements.username, elements.role, data.role);
  displayBadges(data.badges);
};

const styleUserRole = (usernameEl, roleEl, role) => {
  const roleStyles = {
    Owner: { bg: "url('/img/dashboard/rainbow.gif')", color: "transparent" },
    Plus: { color: "blue" },
    Tester: { color: "#24e2d8" },
    Helper: { color: "#1973a0" },
    Moderator: { color: "#bb1bc7" },
    Admin: { color: "#bd0404" }
  };

  const styles = roleStyles[role] || {};
  if (styles.bg) {
    usernameEl.style.background = styles.bg;
    roleEl.style.background = styles.bg;
    usernameEl.style.webkitBackgroundClip = "text";
    roleEl.style.webkitBackgroundClip = "text";
    usernameEl.style.color = styles.color;
    roleEl.style.color = styles.color;
  } else {
    usernameEl.style.color = styles.color || "";
    roleEl.style.color = styles.color || "";
  }
};

const displayBadges = (badges) => {
  const badgeContainer = getElement("badges");
  badgeContainer.innerHTML = '';
  badgeContainer.style.display = "block";
  badges.forEach(badge => {
    const badgeElement = document.createElement("div");
    badgeElement.classList.add("badge");
    badgeElement.innerHTML = `<img src="${badge.image}" alt="${badge.name}">`;
    badgeContainer.appendChild(badgeElement);
  });
};

const formatLargeNumber = (num) => num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '0';

window.onload = () => {
  if (sessionStorage.getItem("loggedIn") === "true") {
    fetchUserData();
  } else {
    window.location.href = "/login.html";
  }
};