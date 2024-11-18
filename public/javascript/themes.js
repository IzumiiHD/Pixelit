
function setTheme(themeName) {
  localStorage.setItem('theme', themeName);
  document.body.className = themeName;
}

function toggleTheme() {
  if (localStorage.getItem('theme') === 'light-green-theme') {
    setTheme('default-theme');
  } else {
    setTheme('light-green-theme');
  }
}

(function () {
  if (localStorage.getItem('theme') === 'light-green-theme') {
    setTheme('light-green-theme');
  } else {
    setTheme('default-theme');
  }
})();

*/