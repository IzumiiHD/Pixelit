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
  event.preventDefault()
  const uv = uname.value
  const pv = psw.value
  ge("id01").style.display = "none"
  socket.emit("login", uv, pv)
}

socket.on("login", (res) => {
  if (res == true) {
    alert("Sucessfully logged in!")
    sessionStorage.username = uname.value
    sessionStorage.password = psw.value
    sessionStorage.loggedin = true
    sessionStorage.rem = rem.checked
    localStorage = sessionStorage
    if (sessionStorage.rem == "false") {
      uname.value = ""
      psw.value = ""
    }
    window.location.href = "/site/dashboard.html"
  } else if(res == false) {
    alert("Incorrect username or password")
  }
  else {
    alert("Account Does not exist")
  }
  console.log(sessionStorage)
})