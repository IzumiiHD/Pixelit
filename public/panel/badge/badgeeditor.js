let badgeData = {
  background: '#000000',
  text: 'Sample Badge',
  textColor: '#ffffff',
  borderColor: '#ffffff',
  borderWidth: 2
};

document.addEventListener('DOMContentLoaded', () => {
  loadBadge();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('background').addEventListener('input', updateBadge);
  document.getElementById('text').addEventListener('input', updateBadge);
  document.getElementById('textColor').addEventListener('input', updateBadge);
  document.getElementById('borderColor').addEventListener('input', updateBadge);
  document.getElementById('borderWidth').addEventListener('input', updateBadge);
  document.getElementById('saveButton').addEventListener('click', saveBadge);
}

function updateBadge() {
  badgeData.background = document.getElementById('background').value;
  badgeData.text = document.getElementById('text').value;
  badgeData.textColor = document.getElementById('textColor').value;
  badgeData.borderColor = document.getElementById('borderColor').value;
  badgeData.borderWidth = document.getElementById('borderWidth').value;

  renderBadge();
}

function renderBadge() {
  const badge = document.getElementById('badge');
  badge.style.backgroundColor = badgeData.background;
  badge.style.color = badgeData.textColor;
  badge.style.borderColor = badgeData.borderColor;
  badge.style.borderWidth = `${badgeData.borderWidth}px`;
  badge.textContent = badgeData.text;
}

async function saveBadge() {
  const username = localStorage.getItem('username'); // Assuming you store the username in localStorage

  if (!username) {
    alert('Please log in to save your badge.');
    return;
  }

  try {
    const response = await fetch('/api/save-badge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, badgeData })
    });

    if (!response.ok) {
      throw new Error('Failed to save badge');
    }

    const result = await response.json();
    alert('Badge saved successfully!');
  } catch (error) {
    console.error('Error saving badge:', error);
    alert('An error occurred while saving the badge. Please try again.');
  }
}

async function loadBadge() {
  const username = localStorage.getItem('username');

  if (!username) {
    console.log('User not logged in. Using default badge.');
    renderBadge();
    return;
  }

  try {
    const response = await fetch(`/api/get-badge/${username}`);

    if (response.ok) {
      badgeData = await response.json();
      renderBadge();
      updateInputs();
    } else if (response.status === 404) {
      console.log('No saved badge found. Using default.');
      renderBadge();
    } else {
      throw new Error('Failed to load badge');
    }
  } catch (error) {
    console.error('Error loading badge:', error);
    alert('An error occurred while loading the badge. Using default.');
    renderBadge();
  }
}

function updateInputs() {
  document.getElementById('background').value = badgeData.background;
  document.getElementById('text').value = badgeData.text;
  document.getElementById('textColor').value = badgeData.textColor;
  document.getElementById('borderColor').value = badgeData.borderColor;
  document.getElementById('borderWidth').value = badgeData.borderWidth;
}