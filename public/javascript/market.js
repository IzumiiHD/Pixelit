let userTokens = 0;
let userPacks = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchUserData();
  fetchPacks();
});

async function fetchUserData() {
  try {
    const response = await fetch('/user');
    const userData = await response.json();
    userTokens = userData.tokens;
    updateTokenDisplay();
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

function updateTokenDisplay() {
  const tokenDisplay = document.getElementById('tokens');
  if (tokenDisplay) {
    tokenDisplay.textContent = userTokens;
  }
}

async function fetchPacks() {
  try {
    const response = await fetch('/packs');
    const packs = await response.json();
    displayPacks(packs);
  } catch (error) {
    console.error('Error fetching packs:', error);
  }
}

function displayPacks(packs) {
  const packContainer = document.getElementById('packContainer');
  packContainer.innerHTML = '';
  packs.forEach(pack => {
    const packElement = createPackElement(pack);
    packContainer.appendChild(packElement);
  });
}

function createPackElement(pack) {
  const divBox = document.createElement('div');
  divBox.className = 'box';
  divBox.setAttribute('data-pack-name', pack.name);

  const packImage = document.createElement('img');
  packImage.src = `/img/packs/${pack.image}`;
  packImage.alt = pack.name;
  packImage.style.width = '100px';
  packImage.style.height = '100px';

  const packName = document.createElement('p');
  packName.textContent = pack.name;
  packName.style.margin = '10px 0 5px 0'; 

  const packCost = document.createElement('p');
  packCost.textContent = `${pack.cost} tokens`;
  packCost.style.margin = '5px 0';

  divBox.appendChild(packImage);
  divBox.appendChild(packName);
  divBox.appendChild(packCost);

  divBox.addEventListener('click', () => openPack(pack.name, pack.cost));

  return divBox;
}

async function openPack(packName, packCost) {
  if (userTokens < packCost) {
    alert('Not enough tokens to open this pack!');
    return;
  }

  const packElement = document.querySelector(`[data-pack-name="${packName}"]`);
  packElement.classList.add('opening');

  try {
    const response = await fetch(`/openPack?pack=${encodeURIComponent(packName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to open pack');
    }

    const result = await response.json();
    console.log("Server response:", result);

    userTokens -= packCost;
    updateTokenDisplay();

    setTimeout(() => {
      packElement.classList.remove('opening');
      showPackContents(result.blook);
    }, 2000);

  } catch (error) {
    console.error('Error opening pack:', error);
    alert('Failed to open pack. Please try again.');
    packElement.classList.remove('opening');
  }
}

function showPackContents(result) {
  console.log("Pack contents:", result);

  const blook = result.blook || result;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.zIndex = '999';
  overlay.onclick = () => document.body.removeChild(overlay);

  const modal = document.createElement('div');
  modal.className = 'box';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.zIndex = '1000';
  modal.style.textAlign = 'center';

  const blookImage = document.createElement('img');
  blookImage.src = `/img/blooks/${blook.image}`;
  blookImage.alt = blook.name || 'Unknown Blook';
  blookImage.style.width = '150px';
  blookImage.style.height = '150px';
  blookImage.style.borderRadius = '5px';
  blookImage.onerror = function() {
    console.error("Failed to load image:", this.src);
    this.src = '/img/blooks/logo.png';
  };

  const blookName = document.createElement('p');
  blookName.textContent = `You got: ${blook.name || 'Unknown Blook'}`;
  blookName.style.margin = '10px 0';

  const blookInfo = document.createElement('p');
  blookInfo.textContent = `Rarity: ${blook.rarity || 'Unknown'}`;
  blookInfo.style.margin = '5px 0';

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.onclick = () => document.body.removeChild(overlay);
  closeButton.style.marginTop = '10px';

  modal.appendChild(blookImage);
  modal.appendChild(blookName);
  modal.appendChild(blookInfo);
  modal.appendChild(closeButton);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);
}

const style = document.createElement('style');
style.textContent = `
  .pack-element {
    transition: transform 0.3s ease;
    cursor: pointer;
  }

  .pack-element:hover {
    transform: scale(1.05);
  }

  .opening {
    animation: packOpening 2s ease-in-out;
  }

  @keyframes packOpening {
    0% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.1) rotate(-5deg); }
    50% { transform: scale(1.2) rotate(5deg); }
    75% { transform: scale(1.1) rotate(-3deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  .pack-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .pack-content {
    background-color: #1a0005;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 0 15px #ff6600;
  }

  .pack-content button {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #ff6600;
    color: #1a0005;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`;
document.head.appendChild(style);

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

function logout() {
  fetch('/logout', { method: 'POST' })
    .then(response => {
      if (response.ok) {
        sessionStorage.clear();
        localStorage.removeItem('loggedIn');
        window.location.href = '/index.html';
      } else {
        console.error('Logout failed');
      }
    })
    .catch(error => console.error('Error:', error));
}