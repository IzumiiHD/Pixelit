function ge(id) {
  return document.getElementById(id);
}

console.log("Chat loaded");

function send(ev) {
  ev.preventDefaut();
  console.log(ev);
}
