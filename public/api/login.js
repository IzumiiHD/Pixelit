const socket = io()

function ge(id) {
  return document.getElementById(id)
}

const uname = ge("uname")
const psw = ge("psw")
const submit = ge("submit")
const rem = ge("remember")

window.onload = () => {
  if (sessionStorage["username"] && sessionStorage["password"] && sessionStorage.rem == "true") {
    uname.value = sessionStorage["username"]
    psw.value = sessionStorage["password"]
  } else {
    rem.checked = false
  }
}


function login(event) {
  event.preventDefault();
  const uv = uname.value;
  const pv = psw.value;
  const requestBody = {
    username: uv,
    password: pv
  };
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => {
    if (response.status === 200) {
      sessionStorage.setItem("loggedIn", true);
      window.location.href = '/dashboard.html';
    } else if (response.status === 500) {
      return response.text().then(text => {
        alert(text);
        ge('error-message').innerText = text;
      });
    } else {
      ge('error-message').innerText = 'Unexpected response status (Username or password may be incorrect): ' + response.status;
    }
  })
  .catch(error => {
    ge('error-message').innerText = 'There was a problem with the fetch operation (Username or password may be incorrect): ' + error;
  });
}

