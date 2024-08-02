/*function ge(id) {
  return document.getElementById(id);
}*/

document.getElementById("admin").style.display = "none";

if (sessionStorage.loggedin == "true") {
  if (admins.includes(sessionStorage.username)) {
      document.getElementById("admin").style.display = "block";
  }
} else {
  window.location = "/site/dashboard.html";
}
