function ge(id) {
  return document.getElementById(id);
}

console.log("HI");

function send(ev) {
  ev.preventDefaut();
  console.log(ev);
}
