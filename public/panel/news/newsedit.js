function ge(id) {
  return document.getElementById(id);
}

const author = sessionStorage.username;
let date = new Date().toLocaleString();

ge("username").innerHTML = author;
ge("date").innerHTML = date;

function postnews(e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const pass = sessionStorage.password;
  date = new Date().toLocaleString();

  socket.emit("newspost", {
    title,
    content,
    author,
    date,
    pass,
  });

  document.getElementById("title").value = ""
  document.getElementById("content").value = ""
    document.getElementById("success-message").style.color = "green";
    document.getElementById("success-message").innerHTML = "News has been successfully posted.";
}
