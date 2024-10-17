const socket = io();

const newsPosts = [];

function createNewsPost(author, date, header, content) {
  const newsContainer = document.createElement("div");
  newsContainer.classList.add("news-container");

  const centerElement = document.createElement("center");

  const headerElement = document.createElement("h1");
  headerElement.classList.add("news-header");
  headerElement.innerHTML = `${header} <i class="fa-solid fa-newspaper"></i>`;
  centerElement.appendChild(headerElement);

  const postContainer = document.createElement("div");
  postContainer.classList.add("new-post");

  const contentCenter = document.createElement("center");
  const contentElement = document.createElement("div");
  contentElement.classList.add("score");
  contentElement.textContent = content;
  contentCenter.appendChild(contentElement);
  postContainer.appendChild(contentCenter);

  const authorElement = document.createElement("div");
  authorElement.classList.add("author");
  authorElement.innerHTML = `Author: ${author} <i class="fa-solid fa-user"></i>`;
  postContainer.appendChild(authorElement);

  const dateElement = document.createElement("div");
  dateElement.classList.add("date");
  dateElement.innerHTML = `Date: ${date} <i class="fa-solid fa-calendar-days"></i>`;
  postContainer.appendChild(dateElement);

  //centerElement.appendChild(postContainer);
  newsContainer.appendChild(centerElement);
  newsContainer.appendChild(postContainer);

  return newsContainer;
}

function generateNewsPosts(postsArray) {
  const container = document.getElementById("container"); 
  container.innerHTML = "";

  for (let i = postsArray.length - 1; i >= 0; i--) {
    const post = postsArray[i];
    const newsPost = createNewsPost(
      post.author,
      post.date,
      post.title,
      post.content,
    );
    container.appendChild(newsPost);
  }
}

socket.on("getNews", (posts) => {
  generateNewsPosts(posts);
});

socket.emit("getNews");

document.getElementById("author").username = sessionStorage.username;
