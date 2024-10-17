const API_BASE_URL = 'https://pixelit.replit.app';
const BLOOK_IMAGE_BASE_URL = `${API_BASE_URL}/img/blooks/`;

const blookName = document.getElementById("blook-name");
const blookImage = document.getElementById("blook-image");
const blookRarity = document.getElementById("blook-rarity");
const blookOwned = document.getElementById("blook-owned");
const setPfpButton = document.getElementById("set-pfp");
const sellButton = document.getElementById("sell-blook");
const container = document.querySelector(".container");

const RARITY_COLORS = {
  uncommon: "#4bc22e",
  rare: "blue",
  epic: "#be0000",
  legendary: "#ff910f",
  chroma: "#00ccff",
  mystical: "#9935dd"
};

const RARITY_VALUES = {
  uncommon: 5,
  rare: 20,
  epic: 75,
  legendary: 200,
  chroma: 300,
  mystical: 1000
};

function getRaritySpan(rarity) {
  const color = RARITY_COLORS[rarity.toLowerCase()] || "black";
  return `<span style='color: ${color};'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
}

function fetchJSON(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  }).then(response => {
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  });
}

function updateBlookInfo(blook, packName) {
  const { name = "Unknown Blook", imageUrl, rarity = "Unknown", owned = 0 } = blook;

  blookName.textContent = name;
  blookImage.src = owned > 0 ? `${BLOOK_IMAGE_BASE_URL}${imageUrl}` : "";
  blookImage.style.display = owned > 0 ? "block" : "none";
  blookRarity.innerHTML = getRaritySpan(rarity);
  blookOwned.textContent = `Owned: ${owned}`;
  setPfpButton.style.display = "block";
  sellButton.style.display = owned > 0 ? "block" : "none";

  let quantityInput = document.getElementById("sell-quantity");
  if (!quantityInput) {
    quantityInput = document.createElement("input");
    quantityInput.id = "sell-quantity";

    const blookInfoElement = document.getElementById("blook-info");
    if (blookInfoElement) {
      blookInfoElement.appendChild(quantityInput);
    } else {
      document.body.appendChild(quantityInput);
    }
  }
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.max = owned.toString();
  quantityInput.value = "1";
  quantityInput.placeholder = "Enter an amount of blooks to sell";

  setPfpButton.onclick = () => changeProfilePicture(name, packName);

  sellButton.onclick = () => sellBlook(name, rarity, owned);
}

function generatePacksHTML(packsData) {
  container.innerHTML = "";

  packsData.forEach(pack => {
    const packDiv = document.createElement("div");
    packDiv.classList.add("pack");

    const packTitle = document.createElement("h2");
    packTitle.textContent = pack.name;
    packTitle.style.borderBottom = "3px solid white";
    packTitle.style.borderRadius = "2px";
    packDiv.appendChild(packTitle);

    const itemsDiv = document.createElement("div");
    itemsDiv.classList.add("items");

    pack.blooks.forEach(blook => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");

      if (blook.owned > 0) {
        const img = document.createElement("img");
        img.src = `${BLOOK_IMAGE_BASE_URL}${blook.imageUrl}`;
        img.alt = blook.name;
        itemDiv.appendChild(img);

        const badge = document.createElement("div");
        badge.classList.add("badge");
        badge.textContent = blook.owned;
        badge.style.textShadow = "1px 1px 2px black";
        badge.style.backgroundColor = RARITY_COLORS[blook.rarity.toLowerCase()];
        itemDiv.appendChild(badge);

        itemDiv.addEventListener("click", () => updateBlookInfo(blook, pack.name));
      } else {
        const lockIcon = document.createElement("i");
        lockIcon.classList.add("fa-solid", "fa-lock");
        itemDiv.appendChild(lockIcon);
      }

      itemsDiv.appendChild(itemDiv);
    });

    packDiv.appendChild(itemsDiv);
    container.appendChild(packDiv);
  });
}

function sellBlook() {
  const name = blookName.textContent;
  const rarity = blookRarity.textContent.toLowerCase();
  const owned = parseInt(blookOwned.textContent.split(": ")[1]);
  const quantityToSell = parseInt(document.getElementById("sell-quantity").value);

  if (isNaN(quantityToSell) || quantityToSell <= 0 || quantityToSell > owned) {
    alert("Please enter a valid quantity to sell.");
    return;
  }

  const tokensToAdd = RARITY_VALUES[rarity] * quantityToSell || 0;

  fetchJSON("/sellBlook", {
    method: "POST",
    body: JSON.stringify({ name, rarity, tokensToAdd, quantity: quantityToSell })
  })
    .then(data => {
      if (data.success) {
        const newOwned = owned - quantityToSell;
        blookOwned.textContent = `Owned: ${newOwned}`;
        alert(`Successfully sold ${quantityToSell} ${name} for ${tokensToAdd} tokens!`);
        sellButton.style.display = newOwned <= 0 ? "none" : "block";
        if (newOwned <= 0) {
          document.getElementById("sell-quantity").remove();
        } else {
          document.getElementById("sell-quantity").max = newOwned.toString();
        }
      } else {
        alert(data.message || "Failed to sell blook. Please try again.");
        if (data.message === "You don't have enough of this blook to sell") {
          blookOwned.textContent = `Owned: ${data.actualOwned}`;
          document.getElementById("sell-quantity").max = data.actualOwned.toString();
        }
      }
    })
    .catch(error => {
      console.error("Error selling blook:", error);
      alert("An error occurred while selling the blook. Please try again.");
    });
}

function changeProfilePicture(name, packName) {
  fetchJSON("/changePfp", {
    method: "POST",
    body: JSON.stringify({ name, parent: packName })
  })
    .then(data => alert(data.message))
    .catch(() => alert("Failed to set profile picture"));
}

function checkUserRole() {
  fetchJSON('/user')
    .then(data => {
      const allowedRoles = ['Owner', 'Admin', 'Moderator', 'Helper'];
      if (allowedRoles.includes(data.role)) {
        document.getElementById('wrench-icon').style.display = 'inline';
      }
    })
    .catch(error => console.error('Error fetching user role:', error));
}

window.onload = () => {
  if (localStorage.loggedin === "true") {
    Object.assign(sessionStorage, localStorage);
  }

  fetchJSON("/user")
    .then(data => generatePacksHTML(data.packs))
    .catch(error => console.error("Error fetching user data:", error));

  checkUserRole();
};

document.addEventListener('DOMContentLoaded', () => {
  if (sellButton) {
    sellButton.addEventListener('click', sellBlook);
  } else {
    console.error('Sell button not found');
  }
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