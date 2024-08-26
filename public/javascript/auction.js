localStorage.setItem('tokens', users.tokens); // Replace 123 with actual token value

document.addEventListener("DOMContentLoaded", () => {
  const tokens = localStorage.getItem('tokens');
  if (tokens !== null) {
    document.getElementById('tokens').innerText = tokens;
  } else {
    console.error("No tokens found in localStorage");
  }
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