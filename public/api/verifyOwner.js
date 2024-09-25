window.onload = () => {
  document.body.style.pointerEvents = "none";
  fetch('/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 500) {
      return response.text().then(text => {
        alert(text);
      });
    } else {
      console.error('Unexpected response status:', response.status);
      throw new Error('Unexpected response status');
    }
  })
  .then(data => {
    if (['Owner'].includes(data.role)) {
      document.getElementById("overlay").style.display = "none";
      document.body.style.pointerEvents = "auto";
    } else {
      window.location.href = '../site/dashboard.html';
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
};
