async function fetchUsers() {
  try {
    const response = await fetch('/user');
    const users = await response.json();
    const userList = document.getElementById('user-list');
    users.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.className = 'user-box';
      userDiv.textContent = `${user.name}`;
      userList.appendChild(userDiv);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

window.onload = fetchUsers;