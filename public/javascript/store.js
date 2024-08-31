document.addEventListener('DOMContentLoaded', () => {
  const buyButton = document.querySelector('stripe-buy-button');

  if (buyButton) {
    buyButton.addEventListener('click', handlePurchase);
  }
});

async function handlePurchase(event) {
  event.preventDefault();

  if (!isUserLoggedIn()) {
    alert('Please log in to make a purchase.');
    return;
  }

  try {
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    const stripe = Stripe('your_publishable_key');
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('Stripe checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again later.');
  }
}

function isUserLoggedIn() {
  return localStorage.getItem('loggedin') === 'true';
}

// Listen for the custom event that Stripe fires on successful payment
window.addEventListener('payment_success', async () => {
  const recipientUsername = prompt("Payment successful! Which user do you want to give Plus to?");
  if (recipientUsername) {
    try {
      const response = await fetch('/update-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: recipientUsername, role: 'Plus' })
      });

      if (response.ok) {
        alert(`Successfully gave Plus role to ${recipientUsername}`);
      } else {
        alert('Failed to update user role. Please contact support.');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('An error occurred while updating the user role. Please try again.');
    }
  }
});