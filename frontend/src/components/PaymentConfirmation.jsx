import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentConfirmation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Checking payment status...');

  useEffect(() => {
    // Simulate checking payment status (replace with API call)
    setTimeout(() => {
      // Placeholder: Check backend for booking payment_status
      setStatus('Payment successful! Redirecting to bookings...');
      setTimeout(() => navigate('/bookings'), 2000);
    }, 2000);
  }, [navigate]);

  return (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Payment Confirmation</h2>
      <p>{status}</p>
    </div>
  );
}

export default PaymentConfirmation;