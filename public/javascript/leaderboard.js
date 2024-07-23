const socket = io();

const leaderboardContainer = document.getElementById("lbc");

socket.emit("getAccounts");

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

socket.on("getAccounts", (accounts) => {
  renderLeaderboard(accounts);
});
