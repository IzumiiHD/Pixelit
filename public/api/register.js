function ge(id) {
  return document.getElementById(id)
}

const socket = io()

let username = ge("uname")
let password = ge("psw")
let age = ge("age")
let reason = ge("rea")


function register(event) {
  event.preventDefault()
  const requestBody = {
    username: username.value,
    password: password.value,
    age: age.value,
    reason: reason.value,
  };
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => {
    if (response.status === 200) {
    alert("your request has been sent to the admins, Please wait for them to review your form. May take up to 12 hours.")
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
  ge('id01').style.display='none' 
  socket.emit("getrequests")
}
