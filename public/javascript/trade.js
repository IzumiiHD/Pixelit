// Script to click on the element with id 'OG Pack' every 2 seconds
setInterval(() => {
    try {
        document.getElementById('OG Pack').click();
    } catch (error) {
        console.log('Ignored an alert:', error.message);
    }
}, 2000);