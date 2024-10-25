if (sessionStorage.loggedIn === 'true') {
  if (window.location.pathname.includes('login.html')) {
    window.location.href = "../dashboard.html";
  }
} else if (window.location.pathname.includes("dashboard.html")) {
  window.location.href = "../login.html";
}