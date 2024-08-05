if (window.location.pathname.includes('dashboard.html') && sessionStorage.loggedIn == false) {
  window.location.href = '../site/login.html';
}