if (sessionStorage.loggedIn == true) {
  window.location.href = "../dashboard.html"
}

if (window.location.pathname.includes('../dashboard.html') && sessionStorage.loggedIn == false) {
  window.location.href = '../login.html';
}