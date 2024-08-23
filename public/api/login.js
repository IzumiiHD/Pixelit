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
      window.location.href = '/site/dashboard.html';
    } else if (response.status === 500) {
      return response.text().then(text => {
        alert(text);
      });
    } else {
      console.error('Unexpected response status:', response.status);
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}