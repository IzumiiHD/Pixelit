document.getElementById('trade').addEventListener('click', function() {
  alert('This feature will be added later upon release');
});

document.getElementById('viewStats').addEventListener('click', function() {
  const userName = prompt('Which user do you want to search?');
});

document.getElementById('goBack').addEventListener('click', function() {
  document.getElementById('detailed-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'block';
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