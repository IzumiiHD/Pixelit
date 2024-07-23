const socket = io();

// Sample data - array of pack objects
let packsData = [
  {
    name: "Wonderland Pack",
    blooks: [
      { name: "Blook1", owned: 2 },
      { name: "Blook2", owned: 0 },
      // Add more blooks as needed
    ]
  },
  {
    name: "Sports Pack",
    blooks: [
      { name: "Blook3", owned: 3 },
      { name: "Blook4", owned: 1 },
      // Add more blooks as needed
    ]
  },
  // Add more packs as needed
];

// Function to generate HTML for packs and blooks dynamically
function generatePacksHTML(packsData) {
  const container = document.querySelector(".container");
  container.innerHTML = ""; // Clear existing content

  packsData.forEach(pack => {
    const packDiv = document.createElement("div");
    packDiv.classList.add("pack");

    const packTitle = document.createElement("h2");
    packTitle.textContent = pack.name;
    packDiv.appendChild(packTitle);

    const itemsDiv = document.createElement("div");
    itemsDiv.classList.add("items");

    pack.blooks.forEach(blook => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");
      itemDiv.style.border = "2px solid " + blook.color || "#666";

      const img = document.createElement("img");
      img.src = blook.owned > 0 ? blook.image : "/img/lock.png"; // Show blook image if owned, else lock icon
      img.alt = blook.owned > 0 ? blook.name : "Locked";

      const badge = document.createElement("div");
      badge.classList.add("badge");
      badge.textContent = blook.owned;

      itemDiv.appendChild(img);
      itemDiv.appendChild(badge);
      itemsDiv.appendChild(itemDiv);
    });

    packDiv.appendChild(itemsDiv);
    container.appendChild(packDiv);
  });
}
socket.emit("getUserPacks", sessionStorage.username)

socket.on("getUserPacks", (packs) => {
  console.log(packs)
  generatePacksHTML(packs)
})
// Call the function to generate HTML on page load
//window.onload = generatePacksHTML;