const socket = io();

const c = document.getElementById("animationCanvas");
const ctx = c.getContext("2d");
c.height = window.innerHeight;
c.width = window.innerWidth;

// Function to dynamically create pack elements
function createPackElement(pack) {
  // Create div element with class "box" and "box2"
  const divBox = document.createElement("div");
  divBox.classList.add("box", "box2");

  // Create center element
  const centerElem = document.createElement("center");

  // Create div element with class "text"
  const divText = document.createElement("div");
  divText.classList.add("text");

  // Create h2 element for pack name
  const h2Elem = document.createElement("h2");
  h2Elem.textContent = pack.name;

  // Create paragraph element for pack cost
  const pElem = document.createElement("p");
  pElem.textContent = "Cost: " + pack.cost;

  // Create img element for pack image
  const imgElem = document.createElement("img");
  imgElem.src = pack.image;
  imgElem.alt = pack.name;
  imgElem.style.width = "250px";

  // Append h2, p, and img elements to divText
  divText.appendChild(h2Elem);
  divText.appendChild(pElem);
  divText.appendChild(imgElem);

  // Append divText to center element
  centerElem.appendChild(divText);

  // Append center element to divBox
  divBox.appendChild(centerElem);
  divBox.id = pack.name;

  // Add onclick event listener to divBox
  divBox.addEventListener("click", () => {
    socket.emit("openPack", pack, {
      name: sessionStorage.username,
      pass: sessionStorage.password,
    });
    divBox.style.pointerEvents = "none";
  });

  return divBox;
}

// Function to render packs
function renderPacks(packs) {
  const container = document.getElementById("packContainer");
  console.log(container);
  packs.forEach((pack) => {
    const packElement = createPackElement(pack);
    container.appendChild(packElement);
  });
}

socket.emit("getPacks");
socket.emit("getTokens", sessionStorage.username);
window.onload = () => {
  document.body.style.pointerEvents = "none";
  fetch('/api/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => {
    if (response.status === 200) {
      return response.json(); // Parse JSON data
    } else if (response.status === 500) {
      return response.text().then(text => {
        alert(text);
      });
    } else {
      console.error('Unexpected response status:', response.status);
      throw new Error('Unexpected response status');
    }
  })
  .then(data => {
    document.getElementById("tokens").innerHTML = data.tokens;

  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
};

// Call renderPacks function with the packs array
socket.on("getPacks", (packs) => {
  if (packs === "get") return;
  renderPacks(packs);
});

socket.on("openPack", (info) => {
  const pack = info.pack;
  const blook = info.blook;
  console.log(pack);
  console.log(blook);
  console.log("opened pack");
  document.getElementById(pack).style.pointerEvents = "auto";
  alert(
    `Opened pack ${pack} and got ${blook.name}, which is a ${blook.rarity} and has ${blook.chance}% chance`,
  );
});