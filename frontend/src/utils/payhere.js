/**
 * PayHere checkout via form POST redirect (no CORS issues on localhost).
 * The JS popup SDK uses XHR to sandbox.payhere.lk and is blocked by CORS in browsers.
 * @see https://support.payhere.lk/api-&-redirect/checkout
 */

const CHECKOUT_URLS = {
  sandbox: 'https://sandbox.payhere.lk/pay/checkout',
  live: 'https://www.payhere.lk/pay/checkout'
};

const FORM_FIELDS = [
  'merchant_id',
  'return_url',
  'cancel_url',
  'notify_url',
  'order_id',
  'items',
  'amount',
  'currency',
  'hash',
  'first_name',
  'last_name',
  'email',
  'phone',
  'address',
  'city',
  'country',
  'delivery_address',
  'delivery_city',
  'delivery_country',
  'custom_1',
  'custom_2'
];

/**
 * Redirect the browser to PayHere hosted checkout (full page POST).
 */
export function redirectToPayHereCheckout(payment) {
  if (!payment?.merchant_id || !payment?.hash) {
    throw new Error('Invalid PayHere payment data');
  }

  const action =
    payment.checkout_url ||
    (payment.sandbox ? CHECKOUT_URLS.sandbox : CHECKOUT_URLS.live);

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  form.acceptCharset = 'UTF-8';
  form.style.display = 'none';

  FORM_FIELDS.forEach((name) => {
    const value = payment[name];
    if (value === undefined || value === null || value === '') return;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
