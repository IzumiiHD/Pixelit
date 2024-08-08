function ge(id) {
  return document.getElementById(id)
}

function send(event) {
  event.preventDefaut();
  console.log(event)
}