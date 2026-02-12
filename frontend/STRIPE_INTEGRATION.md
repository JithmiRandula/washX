# Stripe Payment Integration Guide

## Current Implementation

The WashX application includes a fully functional **frontend payment UI** for Stripe integration. The current implementation includes:

- ✅ Professional payment modal with card input fields
- ✅ Card number formatting (XXXX XXXX XXXX XXXX)
- ✅ Expiry date validation (MM/YY format)
- ✅ CVV input (3 digits, masked)
- ✅ Cardholder name field
- ✅ Payment processing states (loading, success, error)
- ✅ Success animation and confirmation
- ✅ Secure payment indicators
- ✅ Mobile responsive design

## Production Setup

To enable real payments with Stripe, follow these steps:

### 1. Install Stripe Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Get Stripe API Keys

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Add to your environment variables:

**Frontend (.env):**
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

**Backend (.env):**
```
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### 3. Backend Implementation

Create a payment intent endpoint in your backend:

```javascript
// backend/routes/payment.routes.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'lkr', metadata } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId: metadata.bookingId,
        providerId: metadata.providerId,
        customerId: metadata.customerId
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 4. Frontend Integration

Update the `processStripePayment` function in `Providers.jsx`:

```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const processStripePayment = async () => {
  // Validate card details
  if (!validateCardDetails()) {
    return;
  }

  setPaymentProcessing(true);

  try {
    // 1. Create payment intent on backend
    const response = await fetch('/api/payment/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: bookingData.estimate.total,
        currency: 'lkr',
        metadata: {
          bookingId: generateBookingId(),
          providerId: selectedProvider.id,
          customerId: user.id
        }
      })
    });

    const { clientSecret } = await response.json();

    // 2. Confirm payment with Stripe
    const stripe = await stripePromise;
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          number: cardDetails.cardNumber.replace(/\s/g, ''),
          exp_month: cardDetails.expiryDate.split('/')[0],
          exp_year: cardDetails.expiryDate.split('/')[1],
          cvc: cardDetails.cvv
        },
        billing_details: {
          name: cardDetails.cardholderName
        }
      }
    });

    if (error) {
      alert('Payment failed: ' + error.message);
      setPaymentProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        processBooking();
      }, 2000);
    }
  } catch (error) {
    alert('Payment error: ' + error.message);
    setPaymentProcessing(false);
  }
};
```

### 5. Webhook Implementation

Set up webhooks to handle payment confirmations:

```javascript
// backend/routes/webhooks.routes.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update booking status to confirmed
        await updateBookingStatus(paymentIntent.metadata.bookingId, 'confirmed');
        break;
      
      case 'payment_intent.payment_failed':
        // Handle failed payment
        await handleFailedPayment(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

### 6. Test Cards

Use these test cards for development:

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0027 6000 3184 | 3D Secure authentication |

**Test Details:**
- Expiry: Any future date (e.g., 12/34)
- CVV: Any 3 digits (e.g., 123)
- Name: Any name

## Security Best Practices

1. ✅ Never store full card numbers
2. ✅ Always use HTTPS in production
3. ✅ Validate amounts on the backend
4. ✅ Use Stripe's PCI-compliant card elements
5. ✅ Implement webhook signature verification
6. ✅ Store Stripe keys in environment variables
7. ✅ Enable 3D Secure for enhanced security

## Supported Currencies

For Sri Lanka, use:
- **Currency Code:** `lkr` (Sri Lankan Rupee)
- **Amount:** Multiply by 100 (e.g., Rs 1000 = 100000 cents)

## Additional Features

Consider implementing:
- Payment refunds
- Recurring payments/subscriptions
- Payment history tracking
- Multiple payment methods (cards, wallets)
- Invoice generation
- Receipt emails

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Support: https://support.stripe.com

## Current Demo Mode

The current implementation runs in **demo mode** and simulates a successful payment after 2 seconds. No real charges are made. Follow the steps above to enable real payment processing.
