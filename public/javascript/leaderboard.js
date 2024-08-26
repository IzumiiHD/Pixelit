const socket = io();

const leaderboardContainer = document.getElementById("lbc");

fetch("/users", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  }
}).then(response => {
  if (response.ok) {
    return response.json();
  } else {
    console.error(response.statusText);
  }
}).then(data => {
  renderLeaderboard(data.users);
  /*const users = data.users;
  const sortedUsers = users.sort((a, b) => b.tokens - a.tokens);
  const topUsers = sortedUsers.slice(0, 10);
  const leaderboardHTML = topUsers.map(user => {
    return `<div class="leaderboard-item">
      <div class="leaderboard-rank">${topUsers.indexOf(user) + 1}</div>
      <div class="leaderboard-username">${user.username}</div>
      <div class="leaderboard-tokens">${user.tokens}</div>
    </div>`;
  }).join("");
  leaderboardContainer.innerHTML = leaderboardHTML;*/
})


function renderLeaderboard(users) {
  try {
    leaderboardContainer.innerHTML = "";

    // Sort users by tokens in descending order
    users.sort((a, b) => b.tokens - a.tokens);

    const topUsers = users.slice(0, 10);

    // Generate leaderboard entries
    topUsers.forEach((user) => {
      const entryDiv = document.createElement("div");
      entryDiv.className = "lb-entry";

      const nameDiv = document.createElement("div");
      nameDiv.className = "name";
      nameDiv.textContent = user.username;

      const scoreDiv = document.createElement("div");
      scoreDiv.className = "score";
      scoreDiv.textContent = user.tokens;

      entryDiv.appendChild(nameDiv);
      entryDiv.appendChild(scoreDiv);

      leaderboardContainer.appendChild(entryDiv);
    });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    leaderboardContainer.innerHTML =
      '<div class="lb-entry"><div class="name">Error</div><div class="score">Failed to load leaderboard</div></div>';
  }
}
/*
socket.on("getAccounts", (accounts) => {
  renderLeaderboard(accounts);
});
*/

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