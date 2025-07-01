import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentConfirmation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Checking payment status...');

  useEffect(() => {
    // Simulate checking payment status (replace with API call)
    // TODO: Implement actual API call to check payment status and navigate accordingly.
    // For now, the status will remain 'Checking payment status...'
  }, [navigate]);

  return (
    <div className="bg-dark-1 min-h-screen text-text-light pt-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-dark-2 rounded-xl shadow-2xl p-8 border border-dark-3 animate-fade-in text-center">
        <h2 className="text-4xl font-bold text-primary mb-6">Payment Confirmation</h2>
        <p className="text-lg text-text-light">{status}</p>
      </div>
    </div>
  );
}

export default PaymentConfirmation;