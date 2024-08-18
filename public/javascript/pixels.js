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

    const itemsDiv = document.createElement("div");
    itemsDiv.classList.add("items");

    pack.blooks.forEach((blook) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");
      // No border is applied to itemDiv
      const img = document.createElement("img");
      img.src = blook.owned > 0 ? blook.image : "/img/lock-icon.png"; // Show blook image if owned, else lock icon
      img.alt = blook.owned > 0 ? blook.name : "Locked";

      const badge = document.createElement("div");
      badge.classList.add("badge");
      badge.textContent = blook.owned;

      itemDiv.appendChild(img);
      itemDiv.appendChild(badge);
      itemDiv.addEventListener("click", () => {
        const name = blook.name || "Unknown Blook";
        const imageSrc = blook.image;
        const rarity = blook.rarity || "Common";
        const owned = blook.owned || "0";
        if (owned <= 0) return

        // Update the details section
        blookName.textContent = name;
        blookImage.src = imageSrc;
        blookImage.style.display = "block";
        blookRarity.textContent = `Rarity: ${rarity}`;
        blookOwned.textContent = `Owned: ${owned}`;
        setPfpButton.style.display = "block";
        sellButton.style.display = "block";

        // Update button functions
        setPfpButton.onclick = () => {
          // Handle setting as PFP
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
          //alert(`Set ${name} as PFP`);
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
