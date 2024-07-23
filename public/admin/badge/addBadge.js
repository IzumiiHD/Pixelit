// Array of users with their badges
let usersWithBadges = [
    { username: "user1", badges: [] },
    { username: "user2", badges: ["Badge1"] },
    { username: "user3", badges: ["Badge2", "Badge3"] },
    { username: "user4", badges: ["Badge4"] },
    { username: "user5", badges: ["Badge5"] },
];

// Array of available badges with images
let availableBadges = [
    { name: "Badge1", image: "badge1.png" },
    { name: "Badge2", image: "badge2.png" },
    { name: "Badge3", image: "badge3.png" },
    { name: "Badge4", image: "badge4.png" },
    { name: "Badge5", image: "badge5.png" },
];

// Function to generate user list with badges
function generateUserList(usersArray) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";
    usersArray.forEach((user) => {
        const userElement = document.createElement("div");
        userElement.textContent = user.username;
        const badgesContainer = document.createElement("div");
        badgesContainer.classList.add("badges");
        user.badges.forEach((badgeName) => {
            const badge = availableBadges.find(
                (badge) => badge.name === badgeName,
            );
            if (badge) {
                const badgeElement = document.createElement("img");
                badgeElement.src = badge.image;
                badgeElement.title = badge.name;
                badgeElement.alt = badge.name;
                badgeElement.classList.add("badge");
                badgeElement.style.width = "16px";
                badgeElement.style.height = "16px";
                badgesContainer.appendChild(badgeElement);
            }
        });
        userElement.appendChild(badgesContainer);
        // Add dropdown to add badge
        const addDropdown = document.createElement("select");
        availableBadges.forEach((badge) => {
            const option = document.createElement("option");
            option.value = badge.name;
            option.textContent = badge.name;
            addDropdown.appendChild(option);
        });
        userElement.appendChild(addDropdown);
        const addButton = document.createElement("button");
        addButton.textContent = "Add Badge";
        addButton.addEventListener("click", function () {
            const selectedBadge = addDropdown.value;
            if (!user.badges.includes(selectedBadge)) {
                user.badges.push(selectedBadge);
                const badge = availableBadges.find(
                    (badge) => badge.name === selectedBadge,
                );
                if (badge) {
                    socket.emit("addBadge", { username: user.username, badge });
                    user.badges.push(badge);
                }
                filterUsers(document.getElementById("searchInput").value);
            } else {
                alert("User already has this badge!");
            }
        });
        userElement.appendChild(addButton);
        // Add button to remove badge
        const removeDropdown = document.createElement("select");
        user.badges.forEach((badge) => {
            const option = document.createElement("option");
            option.value = badge.name;
            option.textContent = badge.name;
            removeDropdown.appendChild(option);
        });
        userElement.appendChild(removeDropdown);
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove Badge";
        removeButton.addEventListener("click", function () {
            const selectedBadge = removeDropdown.value;
            const badge = user.badges.find(
                    (badge) => badge.name === selectedBadge,
                );
            if (!badge) {
                alert("User does not have this badge!");
                return
            }
            const index = user.badges.indexOf(badge);
            if (index !== -1) {
                user.badges.splice(index, 1);
                if (badge) {
                    socket.emit("removeBadge", {
                        username: user.username,
                        badge: badge,
                    });
                }
                filterUsers(document.getElementById("searchInput").value);
            } else {
                alert("Badge not found!");
            }
        });
        userElement.appendChild(removeButton);
        userList.appendChild(userElement);
    });
}

// Initial user list with badges
generateUserList(usersWithBadges);

// Function to filter users based on search input
function filterUsers(searchInput) {
    const filteredUsers = usersWithBadges.filter((user) =>
        user.username.toLowerCase().includes(searchInput.toLowerCase()),
    );
    generateUserList(filteredUsers);
}

// Event listener for search input
document.getElementById("searchInput").addEventListener("input", function () {
    filterUsers(this.value);
});

socket.emit("getAccounts");
socket.emit("getBadges");

socket.on("getAccounts", (accounts) => {
    if (accounts === "get") {
        socket.emit("getAccounts");
    }
    usersWithBadges = accounts;
    generateUserList(accounts);
});

socket.on("getBadges", (badges) => {
    if (badges === "get") {
        socket.emit("getBadges");
    }
    availableBadges = badges;
    filterUsers(document.getElementById("searchInput").value);
});

socket.on("badgeUpdate", (users) => {
    usersWithBadges = users;
    generateUserList(users);
    filterUsers(document.getElementById("searchInput").value);
})
