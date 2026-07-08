import { Link } from 'react-router-dom';
import '../styles/PaymentCancel.css';

function IconAlert() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#D16257" strokeWidth="1.5" />
      <path d="M12 8v5M12 16h.01" stroke="#D16257" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function PaymentCancel() {
  return (
    <div className="container payment-page">
      <div className="payment-card">
        <IconAlert />
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. You can try again anytime.</p>
        <div className="action-buttons">
          <Link to="/cart" className="btn btn-primary">Return to Cart</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}