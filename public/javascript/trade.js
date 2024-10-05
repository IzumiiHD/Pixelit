document.addEventListener('DOMContentLoaded', function() {
  getUserInfo();
  fetchAndDisplayBlooks();
});

function getUserInfo() {
  fetch("/user")
    .then(response => response.json())
    .then(user => {
      const userPfp = document.getElementById("users-pfp");
      if (userPfp && user.pfp) {
        userPfp.src = user.pfp;
      }
    })
    .catch(error => console.error('Error fetching user info:', error));
}

function fetchAndDisplayBlooks() {
  fetch("/packs")
    .then(response => response.json())
    .then(packs => {
      const blooksContainer = document.getElementById("blooks-container");
      blooksContainer.innerHTML = '';

      packs.forEach(pack => {
        pack.blooks.forEach(blook => {
          if (blook.owned > 0) {
            const blookElement = createBlookElement(blook);
            blooksContainer.appendChild(blookElement);
          }
        });
      });

      setupSearch();
    })
    .catch(error => console.error('Error fetching packs:', error));
}

function createBlookElement(blook) {
  const blookDiv = document.createElement("div");
  blookDiv.className = "blook-item";
  blookDiv.setAttribute("data-name", blook.name);
  blookDiv.setAttribute("data-rarity", blook.rarity);

  const img = document.createElement("img");
  img.src = `https://pixelit.replit.app/img/blooks/${blook.image}`;
  img.alt = blook.name;

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = blook.owned;
  badge.style.textShadow = "1px 1px 2px black";
  badge.style.backgroundColor = getRarityColor(blook.rarity);

  blookDiv.appendChild(img);
  blookDiv.appendChild(badge);

  blookDiv.addEventListener("click", () => {
    console.log(`Selected ${blook.name} for trade`);
  });

  return blookDiv;
}

function getRarityColor(rarity) {
  const colors = {
    uncommon: "#4bc22e",
    rare: "blue",
    epic: "#be0000",
    legendary: "#ff910f",
    chroma: "#00ccff",
    mystical: "#9935dd"
  };
  return colors[rarity] || "gray";
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function() {
    const searchTerm = this.value.toLowerCase();
    const blooks = document.querySelectorAll(".blook-item");

    blooks.forEach(blook => {
      const name = blook.getAttribute("data-name").toLowerCase();
      const rarity = blook.getAttribute("data-rarity").toLowerCase();
      if (name.includes(searchTerm) || rarity.includes(searchTerm)) {
        blook.style.display = "";
      } else {
        blook.style.display = "none";
      }
    });
  });
}