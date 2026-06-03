import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import { CheckCircle, XCircle } from 'lucide-react';
import './PaymentResult.css';

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
    if (isSuccess) {
      sessionStorage.removeItem('washx_checkout_cart');
      sessionStorage.removeItem('washx_payhere_order');
    }
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
