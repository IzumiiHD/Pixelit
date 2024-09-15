async function updateLeaderboard() {
  try {
    const response = await fetch('/users');
    const users = await response.json();

    users.sort((a, b) => b.tokens - a.tokens);

    const top10Users = users.slice(0, 10);

    top10Users.forEach((user, index) => {
      const userElement = document.getElementById(`user${index + 1}`);
      if (userElement) {
        userElement.textContent = `${index + 1}. [${user.rarity}] ${user.username}: ${user.tokens} tokens`;
      }
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

document.addEventListener('DOMContentLoaded', updateLeaderboard);