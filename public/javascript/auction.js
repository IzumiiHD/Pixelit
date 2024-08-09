localStorage.setItem('tokens', users.tokens); // Replace 123 with actual token value

document.addEventListener("DOMContentLoaded", () => {
  const tokens = localStorage.getItem('tokens');
  if (tokens !== null) {
    document.getElementById('tokens').innerText = tokens;
  } else {
    console.error("No tokens found in localStorage");
  }
});