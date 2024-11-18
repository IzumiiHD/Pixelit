const startButton = document.getElementById("start-game");
const gameContainer = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const moleUpload = document.getElementById("upload-mole");

let score = 0;
let moleTimer;
let moleImage = "https://example.com/default-mole.png"; 

function createGrid() {
    const grid = document.querySelector(".grid");
    grid.innerHTML = ""; 
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement("div");
        hole.classList.add("hole");
        const mole = document.createElement("img");
        mole.classList.add("mole");
        mole.src = moleImage;
        mole.addEventListener("click", () => {
            if (mole.style.display === "block") {
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                mole.style.display = "none";
            }
        });
        hole.appendChild(mole);
        grid.appendChild(hole);
    }
}

function showMole() {
    const holes = document.querySelectorAll(".hole");
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    const mole = randomHole.querySelector(".mole");
    mole.style.display = "block";
    setTimeout(() => {
        mole.style.display = "none";
    }, 1000);
}

startButton.addEventListener("click", () => {
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    gameContainer.style.display = "block";
    createGrid();
    clearInterval(moleTimer);
    moleTimer = setInterval(showMole, 1000);
});


moleUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            moleImage = reader.result;
            createGrid();
        };
        reader.readAsDataURL(file);
    }
});