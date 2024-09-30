document.addEventListener('DOMContentLoaded', function() {
  fetch('/user') 
    .then(response => response.json())
    .then(data => {
      const userRole = data.role;
      const allowedRoles = ['Owner', 'Admin', 'Moderator', 'Helper'];
      if (allowedRoles.includes(userRole)) {
        document.getElementById('wrench-icon').style.display = 'inline';
      }
    })
  .catch(error => {
   console.error('Error fetching user role:', error);
    });
});

/*************************************************************/ 

function addSpinClickListener() {
  const spinButton = document.getElementById('spin');
  const tokensDisplay = document.getElementById('tokens');
  const EIGHT_HOURS = 8 * 60 * 60 * 1000;
  let lastSpinTime = 0;

  spinButton.addEventListener('click', async () => {
    const currentTime = Date.now();

    if (currentTime - lastSpinTime < EIGHT_HOURS) {
      alert('You can only claim tokens every 8 hours. Please try later.');
      return;
    }

    const tokensWon = Math.floor(Math.pow(Math.random(), 2.5) * 6) * 100 + 500;

    try {
      const response = await fetch('/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: tokensWon })
      });

      const data = await response.json();

      if (data.message === "Spin successful") {
        const newTokens = parseInt(tokensDisplay.textContent) + tokensWon;
        tokensDisplay.textContent = newTokens;
        alert('Congratulations! You won ' + tokensWon + ' tokens!');

        lastSpinTime = currentTime;
        spinButton.disabled = true;
        spinButton.style.display = 'none';

        setTimeout(() => {
          if (lastSpinTime + EIGHT_HOURS <= Date.now()) {
            spinButton.disabled = false;
            spinButton.style.display = 'inline-block';
          }
        }, EIGHT_HOURS);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while spinning.');
    }
  });
}

addSpinClickListener();