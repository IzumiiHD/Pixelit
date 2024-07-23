const admins = [
  "IzumiiHD",
  "iamgamedude",
  "admin",
];

const socket = io();

document.body.style.pointerEvents = "none";
window.onload = () => {
  if (admins.includes(sessionStorage.username)) {
    socket.emit("login", sessionStorage.username, sessionStorage.password);
    socket.on("login", (res) => {
      if (res == true) {
        document.body.style.pointerEvents = "auto";
      } else {
        window.location = "/site/dashboard.html";
      }
    });
  } else {
    window.location = "/site/dashboard.html";
  }
};
