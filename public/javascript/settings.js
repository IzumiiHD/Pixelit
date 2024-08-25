// settings.js

// Function to fetch user data from server
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", async function() {
  const usernameElement = document.getElementById("username");
  const roleElement = document.getElementById("role");
  const uidElement = document.getElementById("uid");

  // Fetching user data
  const userData = await fetchUserData();

  // If user data is found, update the text content of the elements
  if (userData) {
    if (usernameElement) {
      usernameElement.textContent = `Username: ${userData.username}`;
    }
    if (roleElement) {
      roleElement.textContent = `Role: ${userData.role}`;
    }
    if (uidElement) {
      uidElement.textContent = `UID: ${userData.uid}`;
    }
  } else {
    // Handle the case where user data could not be fetched
    if (usernameElement) {
      usernameElement.textContent = `Username: Unavailable`;
    }
    if (roleElement) {
      roleElement.textContent = `Role: Unavailable`;
    }
    if (uidElement) {
      uidElement.textContent = `UID: Unavailable`;
    }
  }
});
const today = new Date();
const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};
date.innerHTML = today.toLocaleDateString("en-US", dateOptions);
