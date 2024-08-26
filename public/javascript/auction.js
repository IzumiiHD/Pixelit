const socket = io();

if (localStorage.loggedin == "true") {
  sessionStorage = localStorage;
}

function ge(id) {
  return document.getElementById(id);
}

if (sessionStorage.loggedin == "true") {
  username.innerHTML = " " + sessionStorage.username;
  updateTokens();
} else {
}