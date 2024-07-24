

// Function to add a new badge
function addBadge(event) {
  event.preventDefault();
  const badgeNameInput = document.getElementById("badge-name");
  const badgeImageInput = document.getElementById("badge-image");
  const badgeName = badgeNameInput.value.trim();
  const badgeImage = badgeImageInput.value.trim();

  if (badgeName !== "" && badgeImage !== "") {
    const badgeList = document.getElementById("badge-list");
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <img src="${badgeImage}" alt="${badgeName}" width="16" height="16">
        <span>${badgeName}</span>
        <button onclick="removeBadge(this)">Remove</button>
      `;
    badgeList.appendChild(listItem);
    badgeNameInput.value = "";
    badgeImageInput.value = "";
  }
}

// Function to remove a badge
function removeBadge(button) {
  const listItem = button.parentNode;
  listItem.parentNode.removeChild(listItem);
}

document.getElementById("badge-form").addEventListener("submit", addBadge);

document.addEventListener("DOMContentLoaded", function () {
  let initialBadges = [
    { name: "Badge 1", image: "path/to/image1.png" },
    { name: "Badge 2", image: "path/to/image2.png" },
    { name: "Badge 3", image: "path/to/image3.png" },
  ];

  // Function to add a badge to the list
  function addBadgeToList(badge) {
    const badgeList = document.getElementById("badge-list");
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <img src="${badge.image}" alt="${badge.name}" width="16" height="16">
        <span>${badge.name}</span>
        <button onclick="removeBadge(this)">Remove</button>
      `;
    badgeList.appendChild(listItem);
  }

  // Load initial badges
  initialBadges.forEach((badge) => addBadgeToList(badge));

  // Function to add a new badge from the form
  function addBadge(event) {
    event.preventDefault();
    const badgeNameInput = document.getElementById("badge-name");
    const badgeImageInput = document.getElementById("badge-image");
    const badgeName = badgeNameInput.value.trim();
    const badgeImage = badgeImageInput.value.trim();

    if (badgeName !== "" && badgeImage !== "") {
      const badge = { name: badgeName, image: badgeImage };
      addBadgeToList(badge);
      badgeNameInput.value = "";
      badgeImageInput.value = "";
    }
  }

  // Function to remove a badge
  window.removeBadge = function (button) {
    const listItem = button.parentNode;
    listItem.parentNode.removeChild(listItem);
  };

  socket.emit("getBadges");

  socket.on("getBadges", (badges) => {
      if (badges === "get") {
          socket.emit("getBadges");
      }
      initialBadges = badges;
    initialBadges.forEach((badge) => addBadgeToList(badge));
  });

  document.getElementById("badge-form").addEventListener("submit", addBadge);
});
