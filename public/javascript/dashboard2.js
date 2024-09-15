document.getElementById('trade').addEventListener('click', function() {
  alert('This feature will be added later upon release');
});

document.getElementById('viewStats').addEventListener('click', function() {
  alert('This feature will be added later upon release');
});


document.addEventListener('DOMContentLoaded', function() {
  fetch('/user') 
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