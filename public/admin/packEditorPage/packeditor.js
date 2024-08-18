//const socket = io();

function createPack() {
    var packName = document.getElementById("packName").value; //prompt("Enter pack name:");
    var packUrl = document.getElementById("packUrl").value; //prompt("Enter image URL for pack:");
    var packCost = document.getElementById("packCost").value; //prompt("Enter the cost of the pack:");
    if (packName) {
        var packDiv = document.createElement("div");
        packDiv.classList.add("pack");

        var packHeader = document.createElement("h2");
        packHeader.textContent = packName + " - $" + packCost;
        //packHeader.setAttribute("contenteditable", "true"); // Make pack name editable
        packDiv.appendChild(packHeader);

        var packImg = document.createElement("img");
        packImg.src = packUrl;
        packImg.alt = packName;
        packImg.style.width = "100px"; // Set pack image width
        packImg.style.height = "auto"; // Maintain aspect ratio
        packDiv.appendChild(packImg);

        var addBlookButton = document.createElement("button");
        addBlookButton.textContent = "Add Blook";
        addBlookButton.classList.add("button"); // Add button class
        addBlookButton.onclick = function () {
            addBlook(packDiv);
        };
        //packDiv.appendChild(addBlookButton);
        addBlook(packDiv, packName);

        var removePackButton = document.createElement("button");
        removePackButton.textContent = "Remove Pack";
        removePackButton.classList.add("button"); // Add button class
        removePackButton.onclick = function () {
            fetch("/removePack", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: pack.name,
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        console.log(response.statusText);
                    }
                })
                .then((data) => {
                    renderPacks(data.packs);
                });
            packDiv.parentNode.removeChild(packDiv); // Remove the packDiv
        };
        packDiv.appendChild(removePackButton);

        document.getElementById("packs").appendChild(packDiv);

        fetch("/addPack", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: packName,
                image: packUrl,
                cost: packCost,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log(response);
                    console.log("Pack added successfully");
                } else {
                    console.log(response.statusText);
                }
            })
            .then((data) => {
                renderPacks(data.packs);
            })
            .catch((e) => {
                console.log(e);
            });
        /*socket.emit(
            "addPack",
            {
                name: packName,
                cost: packCost,
                image: packUrl,
            },
            { name: sessionStorage.username, pass: sessionStorage.password },
        );*/
        console.log("Added pack");
    }
}

function addBlook(packDiv, packName) {
    var containerDiv = document.createElement("div");
    containerDiv.classList.add("blook-adder");

    var blookNameInput = document.createElement("input");
    blookNameInput.type = "text";
    blookNameInput.placeholder = "Enter blook name";

    var imageUrlInput = document.createElement("input");
    imageUrlInput.type = "text";
    imageUrlInput.placeholder = "Enter image URL for blook";

    var blookRarityInput = document.createElement("select");
    //blookRarityInput.type = "text";
    blookRarityInput.innerHTML =
        "<option value='common'>Common</option><option value='uncommon'>Uncommon</option><option value='rare'>Rare</option><option value='epic'>Epic</option><option value='legendary'>Legendary</option><option value='chroma'>Chroma</option><option value='mystical'>Mystical</option>";
    blookRarityInput.placeholder =
        "Enter the rarity of the blook (common, uncommon, rare)";

    var blookChanceInput = document.createElement("input");
    blookChanceInput.type = "text";
    blookChanceInput.placeholder =
        "Enter the chance of getting this blook (in percentage)";

    var blookColorInput = document.createElement("input");
    blookColorInput.type = "text";
    blookColorInput.placeholder = "Enter the color of this blook (hexadecimal)";

    var addButton = document.createElement("button");
    addButton.textContent = "Add This Blook";
    addButton.classList.add("button"); // Add button class
    addButton.onclick = function () {
        var blookName = blookNameInput.value;
        var imageUrl = imageUrlInput.value;
        var blookRarity = blookRarityInput.value;
        var blookChance = blookChanceInput.value;
        var blookColor = blookColorInput.value;
        if (blookName && imageUrl && blookRarity && blookChance) {
            var blookDiv = document.createElement("div");
            blookDiv.classList.add("blook");

            var blookImg = document.createElement("img");
            blookImg.src = imageUrl;
            blookImg.alt = blookName;
            blookImg.style.width = "50px"; // Set blook image width
            blookImg.style.height = "auto"; // Maintain aspect ratio
            blookDiv.appendChild(blookImg);

            var raritySpan = document.createElement("span");
            raritySpan.textContent =
                "Rarity: " + blookRarity + " - Chance: " + blookChance + "%";
            blookDiv.appendChild(raritySpan);

            var removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.classList.add("button"); // Add button class
            removeButton.onclick = function () {
                fetch("/removeBlook", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: blook.name,
                        parent: pack.name,
                    }),
                }).then((response) => {
                    if (response.ok) {
                        console.log("blook added successfully");
                    } else {
                        console.log(response.statusText);
                    }
                });
                packDiv.removeChild(blookDiv);
            };
            blookDiv.appendChild(removeButton);

            packDiv.appendChild(blookDiv);
            fetch("/addBlook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: blookNameInput.value,
                    image: imageUrlInput.value,
                    rarity: blookRarityInput.value,
                    chance: blookChanceInput.value,
                    parent: packName,
                    owned: 0,
                    color: blookColor,
                }),
            }).then((response) => {
                if (response.ok) {
                    console.log(response);
                    console.log("Blook added successfully");
                } else {
                    console.log(response.statusText);
                }
            });
            // socket.emit(
            //     "addBlook",
            //     {
            //         name: blookNameInput.value,
            //         image: imageUrlInput.value,
            //         rarity: blookRarityInput.value,
            //         chance: blookChanceInput.value,
            //         parent: packName,
            //         owned: 0,
            //         color: blookColor,
            //     },
            //     {
            //         name: sessionStorage.username,
            //         pass: sessionStorage.password,
            //     },
            // );
        }
    };

    containerDiv.appendChild(addButton);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(blookNameInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(imageUrlInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(blookRarityInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(blookChanceInput);
    containerDiv.appendChild(document.createElement("br"));
    containerDiv.appendChild(blookColorInput);
    containerDiv.appendChild(document.createElement("br"));
    packDiv.appendChild(containerDiv);
}

// Assuming packsArray is an array of pack objects, where each pack object contains an array of blooks
function renderPacks(packsArray) {
    var packsContainer = document.getElementById("packs");

    // Clear any existing packs in the container
    packsContainer.innerHTML = "";

    // Iterate over the array of packs
    packsArray.forEach(function (pack) {
        // Create a div element for the pack
        var packDiv = document.createElement("div");
        packDiv.classList.add("pack");

        // Create an h2 element for the pack name and cost
        var packHeader = document.createElement("h2");
        packHeader.textContent = pack.name + " - $" + pack.cost;
        packDiv.appendChild(packHeader);

        // Create an img element for the pack image
        var packImg = document.createElement("img");
        packImg.src = pack.image;
        packImg.alt = pack.name;
        packDiv.appendChild(packImg);

        packImg.style.width = "100px";
        packImg.style.height = "auto";
        /*
        // Create a button to add blooks to the pack
        var addBlookButton = document.createElement("button");
        addBlookButton.textContent = "Add Blook";
        addBlookButton.classList.add("button"); // Add button class
        addBlookButton.onclick = function() {
            addBlook(packDiv, pack.name);
        };
        packDiv.appendChild(addBlookButton);*/

        // // Create a button to remove the pack
        var removePackButton = document.createElement("button");
        removePackButton.textContent = "Remove Pack";
        removePackButton.classList.add("button"); // Add button class
        removePackButton.onclick = function () {
            fetch("/removePack", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: pack.name,
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        console.log(response.statusText);
                    }
                })
                .then((data) => {
                    renderPacks(data.packs);
                });
            // socket.emit("removePack", pack, {
            //     name: sessionStorage.username,
            //     pass: sessionStorage.password,
            // });
            packDiv.parentNode.removeChild(packDiv); // Remove the packDiv
        };
        packDiv.appendChild(removePackButton);

        // Iterate over the array of blooks for this pack
        pack.blooks.forEach(function (blook) {
            // Create a div element for the blook
            var blookDiv = document.createElement("div");
            blookDiv.classList.add("blook");

            // Create an img element for the blook image
            var blookImg = document.createElement("img");
            blookImg.src = blook.imageUrl;
            blookImg.alt = blook.name;
            blookDiv.appendChild(blookImg);

            var raritySpan = document.createElement("span");
            raritySpan.textContent =
                "Rarity: " + blook.rarity + " - Chance: " + blook.chance + "%";
            blookDiv.appendChild(raritySpan);

            blookImg.style.width = "50px"; // Set blook image width
            blookImg.style.height = "auto"; // Maintain aspect ratio

            var removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.classList.add("button"); // Add button class
            removeButton.onclick = function () {
                fetch("/removeBlook", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: blook.name,
                        parent: pack.name,
                    }),
                }).then((response) => {
                    if (response.ok) {
                        console.log("blook added successfully");
                    } else {
                        console.log(response.statusText);
                    }
                });
                // socket.emit("removeBlook", blook, {
                //     name: sessionStorage.username,
                //     pass: sessionStorage.password,
                // });
                packDiv.removeChild(blookDiv);
            };
            blookDiv.appendChild(removeButton);

            // Append the blookDiv to the packDiv
            packDiv.appendChild(blookDiv);
        });

        addBlook(packDiv, pack.name);

        // Append the packDiv to the packsContainer
        packsContainer.appendChild(packDiv);
    });
}

fetch("/packs", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
})
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.log(response.statusText);
        }
    })
    .then((data) => {
        renderPacks(data);
    });

/*
socket.emit("getPacks");

socket.on("getPacks", (packsArray) => {
    if (packsArray === "get") {
        socket.emit("getPacks");
        return;
    }
    renderPacks(packsArray);
});
*/
