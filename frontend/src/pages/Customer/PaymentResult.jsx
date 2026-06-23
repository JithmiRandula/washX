import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import { CheckCircle, XCircle } from 'lucide-react';
import './PaymentResult.css';
import { cartAPI } from '../../api/commerceApi';

const PaymentResult = ({ status }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId =
    searchParams.get('order_id') ||
    sessionStorage.getItem('washx_payhere_order') ||
    null;
  const customerId = user?.customerId;

  const isSuccess = status === 'success';

  useEffect(() => {
    const saveOrderIfSuccess = async () => {
      if (!isSuccess) return;

      try {
        const orderRef =
          searchParams.get('order_id') || sessionStorage.getItem('washx_payhere_order');
        const cartJson = sessionStorage.getItem('washx_checkout_cart');
        if (!orderRef || !cartJson) {
          sessionStorage.removeItem('washx_checkout_cart');
          sessionStorage.removeItem('washx_payhere_order');
          return;
        }

        const cart = JSON.parse(cartJson);
        const items = (cart || []).map((c) => ({
          ProviderId: c.providerId || 0,
          ServiceId:  c.serviceId  || null,
          ItemId:     c.itemId     || null,
          Kind:       c.kind       || 'item',
          Quantity:   c.quantity   || 1,
          UnitPrice:  Number(c.unitPrice || 0) || 0,
          Price:      Number(c.price     || 0) || 0,
          Description: c.description || c.title || c.itemName || ''
        }));

        const total = items.reduce((s, it) => s + (Number(it.Price) || 0), 0);

        // lazy import API to avoid cycles
        const { ordersAPI } = await import('../../api/commerceApi');

        // Create order on server
        await ordersAPI.create({
          OrderReference: orderRef,
          CustomerId: user?.customerId ?? null,
          TotalAmount: total,
          PaymentProvider: 'PayHere',
          PaymentStatus: 'Paid',
          Notes: null,
          Items: items
        });

        // Ensure server-side cart is cleared (idempotent)
        try {
          await cartAPI.clear();
        } catch (e) {
          console.warn('Failed to clear server cart after order creation:', e);
        }
      } catch (e) {
        console.error('Failed to save order:', e);
      } finally {
        sessionStorage.removeItem('washx_checkout_cart');
        sessionStorage.removeItem('washx_payhere_order');
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
              ? 'Your PayHere payment was completed. Your order will be confirmed shortly.'
              : 'You closed or cancelled the payment. Your cart items are still saved.'}
          </p>

          {orderId && (
            <p className="payment-result-order">
              Order reference: <strong>{orderId}</strong>
            </p>
          )}

          <div className="payment-result-actions">
            {customerId && (
              <Link to={`/customer/${customerId}/findproviders`} className="payment-result-btn primary">
                Continue Shopping
              </Link>
            )}
            {customerId && isSuccess && (
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
