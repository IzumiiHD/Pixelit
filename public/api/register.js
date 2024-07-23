function ge(id) {
  return document.getElementById(id)
}

const socket = io()

let username = ge("uname")
let password = ge("psw")
let reason = ge("rea")

function register(event) {
  event.preventDefault()
  socket.emit("register", username.value, password.value, reason.value)
  ge('id01').style.display='none' 
  socket.emit("getrequests")
  alert("your request has been sent to the admins, Please wait for them to review your form. May take up to 12 hours.")
}
