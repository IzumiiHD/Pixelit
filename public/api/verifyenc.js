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
    if (['Owner', 'Admin', 'Moderator' , 'Trial Staff'].includes(data.role)) {
      document.getElementById("overlay").style.display = "none";
      document.body.style.pointerEvents = "auto";
    } else {
      window.location.href = '/';
    }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
};


document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const displaySiteSpeed = (data) => {
    document.getElementById('latency').innerText = data.latency + ' ms';
    document.getElementById('speed').innerText = data.speed + ' Mbps';
  };

  socket.on('updateStats', (data) => {
    displaySiteSpeed(data);
  });

  const requestSiteSpeed = () => {
    socket.emit('request-stats');
  };

  setInterval(requestSiteSpeed, 2000);
});