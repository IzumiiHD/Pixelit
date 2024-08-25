document.getElementById('buy-button').addEventListener('click', async () => {
  const buyButton = document.getElementById('buy-button');
  const buyButtonId = buyButton.getAttribute('data-buy-button-id');
  const publishableKey = buyButton.getAttribute('data-publishable-key');
  const stripe = Stripe(publishableKey);
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId: buyButtonId })
  });
  const session = await response.json();
  // Redirect to Stripe Checkout
  const result = await stripe.redirectToCheckout({ sessionId: session.id });
  if (result.error) {
    console.error(result.error.message);
  }
});