window.onload = () => {
  document.body.style.pointerEvents = "none";
  if (admins.includes(sessionStorage.username)) {
    socket.emit("login", sessionStorage.username, sessionStorage.password);
    socket.on("login", (res) => {
      if (res == true) {
        ge("overlay").style.display = "none";
        document.body.style.pointerEvents = "auto";
        socket.emit("getrequests");
      } else {
        window.location = "/site/dashboard.html";
      }
    });
  } else {
    window.location = "/site/dashboard.html";
  }
};
