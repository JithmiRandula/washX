import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import { CheckCircle, XCircle } from 'lucide-react';
import './PaymentResult.css';
import { cartAPI } from '../../api/commerceApi';
import bulkRequestsApi from '../../api/bulkRequestsApi';

const PaymentResult = ({ status }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId =
    searchParams.get('order_id') ||
    sessionStorage.getItem('washx_payhere_order') ||
    null;
  const customerId = user?.customerId;

  // Read once on first render, before the effect below clears sessionStorage —
  // determines which confirmation copy/links to show.
  const [isBulkPayment] = useState(() => sessionStorage.getItem('washx_bulk_payment') !== null);

  const isSuccess = status === 'success';

  useEffect(() => {
    const finishBulkPaymentIfSuccess = async () => {
      // Read THEN clear synchronously before any await (same StrictMode-double-invoke guard
      // used below for item orders) — but only touch washx_payhere_order when this really
      // is a bulk payment, so the item-order branch below still has it available otherwise.
      const bulkJson = sessionStorage.getItem('washx_bulk_payment');
      if (!bulkJson) return false;

      sessionStorage.removeItem('washx_bulk_payment');
      sessionStorage.removeItem('washx_payhere_order');
      if (!isSuccess) return true;

      try {
        const { bulkRequestId } = JSON.parse(bulkJson);
        if (bulkRequestId) await bulkRequestsApi.markPaid(bulkRequestId, 'PayHere');
      } catch (e) {
        console.error('Failed to confirm bulk request payment:', e);
      }
      return true;
    };

    const saveOrderIfSuccess = async () => {
      // Bulk-request payments take a different completion path (no cart/order to create).
      const wasBulkPayment = await finishBulkPaymentIfSuccess();
      if (wasBulkPayment) return;

      if (!isSuccess) return;

      // Read THEN clear synchronously before any await.
      // This prevents React StrictMode's double-invocation from creating duplicate orders:
      // the second call will find empty storage and exit early.
      const orderRef =
        searchParams.get('order_id') || sessionStorage.getItem('washx_payhere_order');
      const cartJson = sessionStorage.getItem('washx_checkout_cart');
      const deliveryJson = sessionStorage.getItem('washx_checkout_delivery');
      sessionStorage.removeItem('washx_checkout_cart');
      sessionStorage.removeItem('washx_checkout_delivery');
      sessionStorage.removeItem('washx_payhere_order');

      if (!orderRef || !cartJson) return;

      try {
        const cart = JSON.parse(cartJson);
        const items = (cart || []).map((c) => ({
          ProviderId:  c.providerId || 0,
          ServiceId:   c.serviceId  || null,
          ItemId:      c.itemId     || null,
          Kind:        c.kind       || 'item',
          Quantity:    c.quantity   || 1,
          UnitPrice:   Number(c.unitPrice || 0) || 0,
          Price:       Number(c.price     || 0) || 0,
          Description: c.description || c.title || c.itemName || ''
        }));

        let deliveries = [];
        try { deliveries = deliveryJson ? JSON.parse(deliveryJson) : []; } catch { deliveries = []; }
        const deliveryPayload = (deliveries || []).map((d) => ({
          ProviderId:     d.providerId || 0,
          DeliveryOption: d.deliveryOption === 'provider' ? 'provider' : 'self',
          DeliveryFee:    Number(d.deliveryFee || 0)
        }));

        const itemsTotal = items.reduce((s, it) => s + (Number(it.Price) || 0), 0);
        const deliveryTotal = deliveryPayload.reduce(
          (s, d) => s + (d.DeliveryOption === 'provider' ? d.DeliveryFee : 0), 0
        );
        const total = itemsTotal + deliveryTotal;

        const { ordersAPI } = await import('../../api/commerceApi');
        await ordersAPI.create({
          OrderReference: orderRef,
          CustomerId:     user?.customerId ?? null,
          TotalAmount:    total,
          PaymentProvider: 'PayHere',
          PaymentStatus:   'Paid',
          Notes: null,
          Items: items,
          Deliveries: deliveryPayload
        });

        try { await cartAPI.clear(); } catch { /* non-fatal */ }
      } catch (e) {
        console.error('Failed to save order:', e);
      }
    };

    saveOrderIfSuccess();
  }, [isSuccess]);

  return (
    <>
      <CustomerNavbar />
      <div className="payment-result-page">
        <div className={`payment-result-card ${isSuccess ? 'success' : 'cancel'}`}>
          {isSuccess ? (
            <CheckCircle size={56} className="payment-result-icon" />
          ) : (
            <XCircle size={56} className="payment-result-icon" />
          )}

          <h1>{isSuccess ? 'Payment Successful' : 'Payment Cancelled'}</h1>
          <p>
            {isSuccess
              ? isBulkPayment
                ? 'Your bulk laundry payment was completed. Your provider will start processing shortly.'
                : 'Your PayHere payment was completed. Your order will be confirmed shortly.'
              : isBulkPayment
                ? 'You closed or cancelled the payment. You can pay again anytime from your Bulk Requests.'
                : 'You closed or cancelled the payment. Your cart items are still saved.'}
          </p>

          {orderId && (
            <p className="payment-result-order">
              Order reference: <strong>{orderId}</strong>
            </p>
          )}

          <div className="payment-result-actions">
            {customerId && !isBulkPayment && (
              <Link to={`/customer/${customerId}/findproviders`} className="payment-result-btn primary">
                Continue Shopping
              </Link>
            )}
            {customerId && isBulkPayment && (
              <Link to={`/customer/${customerId}/bulk-requests`} className="payment-result-btn primary">
                View Bulk Requests
              </Link>
            )}
            {customerId && isSuccess && !isBulkPayment && (
              <Link to={`/customer/${customerId}/mybooking`} className="payment-result-btn secondary">
                View My Bookings
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentResult;
