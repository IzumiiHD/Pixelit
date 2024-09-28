const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

function addAuction() {
  
  const modal = document.createElement('div');
  modal.style.width = '500px';
  modal.style.height = '700px';
  modal.style.fontSize = '18px';
  modal.style.borderRadius = '5px';
  modal.style.backgroundColor = '#6f057a';
  modal.style.color = 'white';
  modal.style.border = 'none';
  modal.style.padding = '10px 20px';
  modal.style.boxShadow = '3px 3px 10px rgba(0, 30, 87, 0.751)';
  modal.style.fontFamily = 'Pixelify Sans';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';

  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  document.body.appendChild(modalOverlay);
  
  // Create a close button for the modal
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.fontSize = '26px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    document.body.removeChild(modalOverlay);
  });
  
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.transition = 'color 0.3s ease';
    closeButton.style.color = 'red';
  });
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.transition = 'color 0.3s ease';
    closeButton.style.color = '';
  });

  // Attach the close button to the modal
  modal.appendChild(closeButton);

  // Append the modal to the body
  document.body.appendChild(modal);
}

function searchBlook() {
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  document.body.appendChild(modalOverlay);

  const searchWrapper = document.createElement('div');
  searchWrapper.style.width = '500px';
  searchWrapper.style.height = '300px';
  searchWrapper.style.fontSize = '14px';
  searchWrapper.style.borderRadius = '5px';
  searchWrapper.style.backgroundColor = '#6f057a';
  searchWrapper.style.color = 'white';
  searchWrapper.style.border = 'none';
  searchWrapper.style.padding = '10px 20px';
  searchWrapper.style.cursor = 'pointer';
  searchWrapper.style.boxShadow = '3px 3px 10px rgba(0, 30, 87, 0.751)';
  searchWrapper.style.fontFamily = 'Pixelify Sans';
  searchWrapper.style.marginLeft = '45px';
  searchWrapper.style.display = 'flex';
  searchWrapper.style.flexDirection = 'column';
  searchWrapper.style.justifyContent = 'center';
  searchWrapper.style.alignItems = 'center';
  searchWrapper.style.position = 'absolute';
  searchWrapper.style.top = '50%';
  searchWrapper.style.left = '50%';
  searchWrapper.style.transform = 'translate(-50%, -50%)';

  const searchText = document.createElement('div');
  searchText.innerText = 'What Pixel do you want to search for?';
  searchText.style.fontSize = '24px';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.style.width = '100%';
  searchInput.style.marginTop = '10px';

  const cancelButton = document.createElement('button');
  cancelButton.innerHTML = '<i class="fas fa-times"></i>';
  cancelButton.style.position = 'absolute';
  cancelButton.style.top = '10px';
  cancelButton.style.right = '10px';
  cancelButton.style.fontSize = '26px'; // made it bigger
  cancelButton.style.cursor = 'pointer'; // added cursor pointer
  cancelButton.style.background = 'none'; // removed background
  cancelButton.style.border = 'none'; // removed border
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });

  cancelButton.addEventListener('mouseover', () => {
    cancelButton.style.transition = 'color 0.3s ease';
    cancelButton.style.color = 'red';
  });

  cancelButton.addEventListener('mouseout', () => {
    cancelButton.style.transition = 'color 0.3s ease';
    cancelButton.style.color = '';
  });
  
  searchWrapper.appendChild(searchText);
  searchWrapper.appendChild(searchInput);
  searchWrapper.appendChild(cancelButton);
  modalOverlay.appendChild(searchWrapper);
}

window.onload = () => {
  //document.body.style.pointerEvents = "none";
  fetch("/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json(); // Parse JSON data
      } else if (response.status === 500) {
        return response.text().then((text) => {
          alert(text);
        });
      } else {
        console.error("Unexpected response status:", response.status);
        throw new Error("Unexpected response status");
      }
    })
    .then((data) => {
      document.getElementById("tokens").innerHTML = data.tokens;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};

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