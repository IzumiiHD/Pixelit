if (sessionStorage.loggedIn == "false") {
  alert('You are not logged in.');
  window.location.href = document.referrer || '/dashboard.html';
}

const stripe = stripe('pk_test_51PrlRcAE7YDfnyYkLS8xnhT2XmUOdrXepniFIEJO4gfzYmSEOtZaptupJ1g4ZUT9hDNJcF9Bfz1WW3WXQwZxi9C900BCplZq4l');

async function handlePurchase() {
  try {
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

document.getElementById('purchaseButton').addEventListener('click', handlePurchase);