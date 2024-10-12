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
        return response.json();
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

function generatePacksHTML(packsData) {
  const container = document.querySelector(".container");
  container.innerHTML = "";

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

//window.onload = generatePacksHTML;

document.addEventListener('DOMContentLoaded', function() {
  const sellButton = document.getElementById('sell-blook');
  if (sellButton) {
    sellButton.addEventListener('click', sellBlook);
  } else {
    console.error('Sell button not found');
  }
});

function sellBlook() {
  console.log('Sell button clicked');
  const name = document.getElementById("blook-name").textContent;
  const rarity = document.getElementById("blook-rarity").textContent.toLowerCase();
  const ownedElement = document.getElementById("blook-owned");
  const owned = parseInt(ownedElement.textContent.split(": ")[1]);
  const sellButton = document.getElementById('sell-blook');

  if (owned <= 0) {
    alert("You don't have any of this blook to sell!");
    return;
  }

  const rarityValues = {
    uncommon: 5,
    rare: 20,
    epic: 75,
    legendary: 200,
    chroma: 300,
    mystical: 1000
  };

  const tokensToAdd = rarityValues[rarity] || 0;

  fetch("/sellBlook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, rarity, tokensToAdd }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const newOwned = owned - 1;
        ownedElement.textContent = `Owned: ${newOwned}`;
        alert(`Successfully sold ${name} for ${tokensToAdd} tokens!`);

        if (newOwned <= 0) {
          sellButton.style.display = "none";
        }
      } else {
        alert(data.message || "Failed to sell blook. Please try again.");

        if (data.message === "You don't have any of this blook to sell") {
          ownedElement.textContent = "Owned: 0";
          sellButton.style.display = "none";
        }
      }
    })
    .catch(error => {
      console.error("Error selling blook:", error);
      alert("An error occurred while selling the blook. Please try again.");
    });
}

function updateBlookInfo(blook) {
  const name = blook.name || "Unknown Blook";
  const imageSrc = "https://pixelit.replit.app/img/blooks/" + blook.image;
  const rarity = blook.rarity || "Rarity";
  const owned = blook.owned || 0;

  document.getElementById("blook-name").textContent = name;
  document.getElementById("blook-image").src = imageSrc;
  document.getElementById("blook-image").style.display = owned > 0 ? "block" : "none";
  document.getElementById("blook-rarity").innerHTML = getRaritySpan(rarity);
  document.getElementById("blook-owned").textContent = `Owned: ${owned}`;
  document.getElementById("set-pfp").style.display = "block";

  const sellButton = document.getElementById("sell-blook");
  if (sellButton) {
    sellButton.style.display = owned > 0 ? "block" : "none";
  }
}

function getRaritySpan(rarity) {
  const colors = {
    uncommon: "#4bc22e",
    rare: "blue",
    epic: "#be0000",
    legendary: "#ff910f",
    chroma: "#00ccff",
    mystical: "#9935dd"
  };
  const color = colors[rarity.toLowerCase()] || "black";
  return `<span style='color: ${color};'>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>`;
}

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