if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
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
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};

  
const blookItems = document.querySelectorAll(".item");
const blookName = document.getElementById("blook-name");
const blookImage = document.getElementById("blook-image");
const blookRarity = document.getElementById("blook-rarity");
const blookOwned = document.getElementById("blook-owned");
const setPfpButton = document.getElementById("set-pfp");
const sellButton = document.getElementById("sell-blook");

/*blookItems.forEach((item) => {
  item.addEventListener("click", () => {
    const name = item.getAttribute("data-name") || "Unknown Blook";
    const imageSrc = item.querySelector("img").getAttribute("src");
    const rarity = item.getAttribute("data-rarity") || "Common";
    const owned = item.getAttribute("data-owned") || "0";

    // Update the details section
    blookName.textContent = name;
    blookImage.src = imageSrc;
    blookImage.style.display = "block";
    blookRarity.textContent = `Rarity: ${rarity}`;
    blookOwned.textContent = `${owned} Owned`;
    setPfpButton.style.display = "block";
    sellButton.style.display = "block";

    // Update button functions
    setPfpButton.onclick = () => {
      // Handle setting as PFP
      alert(`Set ${name} as PFP`);
      // Emit an event to the backend if necessary
      // socket.emit('setPfp', { name });
    };

    sellButton.onclick = () => {
      // Handle selling
      alert(`Sell ${name}`);
      // Emit an event to the backend if necessary
      // socket.emit('sellBlook', { name });
    };
  });
});*/

// Function to generate HTML for packs and blooks dynamically
function generatePacksHTML(packsData) {
  const container = document.querySelector(".container");
  container.innerHTML = ""; // Clear existing content

  packsData.forEach((pack) => {
    const packDiv = document.createElement("div");
    packDiv.classList.add("pack");

    const packTitle = document.createElement("h2");
    packTitle.textContent = pack.name;
    packDiv.appendChild(packTitle);

    packTitle.style.borderBottom = "3px solid white";
    packTitle.style.borderRadius = "2px";
    packDiv.appendChild(packTitle);
    const itemsDiv = document.createElement("div");
    itemsDiv.classList.add("items");

    pack.blooks.forEach((blook) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");
      const img = document.createElement("img");
      img.src = blook.owned > 0 ? "https://pixelit.replit.app/img/blooks/" + blook.image : "";
      img.alt = blook.owned > 0 ? blook.name : "";

      const badge = document.createElement("div");
      badge.classList.add("badge");
      badge.textContent = blook.owned;
      badge.style.textShadow = "1px 1px 2px black";
      if (blook.rarity === "uncommon") {
        badge.style.backgroundColor = "#4bc22e";
      }
      if (blook.rarity === "rare") {
        badge.style.backgroundColor = "blue";
      }
      if (blook.rarity === "epic") {
        badge.style.backgroundColor = "#be0000";
      }
      if (blook.rarity === "legendary") {
        badge.style.backgroundColor = "#ff910f";
      }
      if (blook.rarity === "chroma") {
        badge.style.backgroundColor = "#00ccff";
      }
      if (blook.rarity === "mystical") {
        badge.style.backgroundColor = "#9935dd";
      }

      itemDiv.appendChild(img);
      itemDiv.appendChild(badge);
      itemDiv.addEventListener("click", () => {
        const name = blook.name || "Unknown Blook";
        const ImageSrc = "https://pixelit.replit.app/img/blooks/" + blook.src;
        const rarity = blook.rarity || "Rarity";
        const owned = blook.owned || "0";
        if (owned <= 0) return

        blookName.textContent = name;
        const imageSrc = blook.owned > 0 
          ? "https://pixelit.replit.app/img/blooks/" + blook.image 
          : "";
        blookImage.src = imageSrc;
        blookImage.style.display = blook.owned > 0 ? "block" : "none";
        blookRarity.innerHTML = rarity === 'uncommon' 
          ? `<span style='color: #4bc22e;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`
          : rarity === 'rare'
          ? `<span style='color: blue;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`
          : rarity === 'epic'
          ? `<span style='color: #be0000;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`
          : rarity === 'legendary'
          ? `<span style='color: #ff910f;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`
          : rarity === 'chroma'
          ? `<span style='color: #00ccff;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`
          : rarity === 'mystical'
          ? `<span style='color: #9935dd;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`
          : `${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
        blookOwned.textContent = `Owned: ${owned}`;
        setPfpButton.style.display = "block";
        sellButton.style.display = "block";

        setPfpButton.onclick = () => {
          fetch("/changePfp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, parent: pack.name }),
          }).then(response => {
            if (response.ok) {
              return response.json()
            } else {
              alert("Failed to set profile picture");
            }
          }).then(data => {
            alert(data.message)
          })
        };
      });
      itemsDiv.appendChild(itemDiv);
    });

    packDiv.appendChild(itemsDiv);
    container.appendChild(packDiv);
  });
}

fetch("/user", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      console.error(response.statusText);
    }
  })
  .then((data) => {
    const packs = data.packs;
    generatePacksHTML(packs);
  });

/*socket.emit("getUserPacks", sessionStorage.username)

socket.on("getUserPacks", (packs) => {
  console.log(packs)
  generatePacksHTML(packs)
})*/

// Call the function to generate HTML on page load
//window.onload = generatePacksHTML;

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

const modal = document.getElementById("sellModal");
const closeBtn = document.getElementsByClassName("close")[0];
const confirmSellBtn = document.getElementById("confirmSell");
const cancelSellBtn = document.getElementById("cancelSell");
const modalPixelImage = document.getElementById("modalPixelImage");
const modalPixelName = document.getElementById("modalPixelName");
const modalPixelRarity = document.getElementById("modalPixelRarity");

function openModal(name, imageSrc, rarity) {
  modalPixelImage.src = imageSrc.includes("http") 
    ? imageSrc 
    : "https://pixelit.replit.app/img/blooks/" + imageSrc;
  modalPixelImage.style.display = "block";
  modalPixelName.textContent = name;
  if (rarity === 'uncommon') {
    modalPixelRarity.innerHTML = `<span style='color: 4bc22e;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
  } else if (rarity === 'rare') {
    modalPixelRarity.innerHTML = `<span style='color: blue;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
  } else if (rarity === 'epic') {
    modalPixelRarity.innerHTML = `<span style='color: #be0000;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
  } else if (rarity === 'legendary') {
    modalPixelRarity.innerHTML = `<span style='color: #ff910f;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
  } else if (rarity === 'chroma') {
    modalPixelRarity.innerHTML = `<span style='color: #00ccff;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
  } else if (rarity === 'mystical') {
    modalPixelRarity.innerHTML = `<span style='color: #9935dd;'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
  } else {
    modalPixelRarity.textContent = rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

closeBtn.onclick = closeModal;

window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}

cancelSellBtn.onclick = closeModal;

confirmSellBtn.onclick = function() {
  const name = modalPixelName.textContent;
  fetch('/sellBlook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    closeModal();
    fetch("/user")
      .then(response => response.json())
      .then(data => {
        const packs = data.packs;
        generatePacksHTML(packs);
      });
  })
  .catch(error => {
    console.error('Error selling blook:', error);
    alert('An error occurred while selling the blook');
  });
};

  sellButton.onclick = () => {
    const name = blookName.textContent;
    const imageSrc = blookImage.src.includes("/blooks/")
      ? blookImage.src
      : "https://pixelit.replit.app/img/blooks/" + blookImage.src;
    const rarity = blookRarity.textContent;

    const modalContent = document.getElementById('modal-content');
    modalContent.querySelector('.modal-name').textContent = name;
    modalContent.querySelector('.modal-image').src = imageSrc;
    modalContent.querySelector('.modal-rarity').textContent = rarity;
    document.getElementById('modal').style.display = 'block';
};