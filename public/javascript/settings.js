const today = new Date();
const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};
date.innerHTML = today.toLocaleDateString("en-US", dateOptions);
