import React, { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, ArrowLeft, CheckCircle2, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { API_BASE } from '../api';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const PayHostedPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id') || 'order_demo_12345';
  const amountStr = params.get('amount') || '2499';
  const amountNum = parseFloat(amountStr) || 2499;
  const customerName = params.get('customer') || 'Moon Enterprises';
  const invoiceNum = params.get('invoice') || 'INV-2026-8421';
  const desc = params.get('desc') || 'Revenue Recovery Payment';

  const [loading, setLoading] = useState(false);
  const [paidStatus, setPaidStatus] = useState<{ paid: boolean; payment_id?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayNow = () => {
    setLoading(true);
    setErrorMessage(null);

    const options = {
      key: 'rzp_test_TWnp4ewYt2QzQX',
      amount: Math.round(amountNum * 100),
      currency: 'INR',
      name: 'Razorpay Revenue Recovery',
      description: desc,
      order_id: orderId.startsWith('order_') ? orderId : undefined,
      prefill: {
        name: customerName,
        email: 'customer@example.com',
        contact: '+919876543210',
      },
      notes: {
        invoice_number: invoiceNum,
        recovery_agent: 'Rakshak AI',
      },
      theme: {
        color: '#305EFF',
      },
      handler: async function (response: any) {
        setLoading(false);
        const payId = response.razorpay_payment_id || 'pay_' + Math.random().toString(36).substring(2, 12);
        setPaidStatus({ paid: true, payment_id: payId });

        try {
          await fetch(API_BASE + '/api/webhook/razorpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'payment.captured',
              payload: {
                payment: {
                  entity: {
                    id: payId,
                    amount: Math.round(amountNum * 100),
                    currency: 'INR',
                    status: 'captured',
                    order_id: orderId,
                    invoice_id: invoiceNum,
                    email: 'customer@example.com',
                    contact: '+919876543210',
                    notes: { invoice_number: invoiceNum },
                  },
                },
              },
            }),
          });
        } catch (err) {
          console.warn('Webhook notification error:', err);
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    if (window.Razorpay) {
      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setLoading(false);
          setErrorMessage(resp.error?.description || 'Payment process was declined by bank.');
        });
        rzp.open();
      } catch (err: any) {
        setLoading(false);
        setErrorMessage(err?.message || 'Failed to launch Razorpay Checkout SDK');
      }
    } else {
      setLoading(false);
      setErrorMessage('Razorpay SDK script loading. Please retry in 2 seconds.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#305EFF]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#131b29] border border-white/10 rounded-2xl p-6 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#305EFF] to-[#6085FF] flex items-center justify-center shadow-lg shadow-[#305EFF]/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Razorpay Recovery Portal</h1>
              <p className="text-xs text-blue-400 font-mono">Autonomous Test Settlement</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Razorpay Test Mode
          </span>
        </div>

        {paidStatus?.paid ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-400">Payment Successful!</h2>
              <p className="text-sm text-gray-400 mt-1">
                ₹{amountNum.toLocaleString('en-IN')} recovered for invoice <span className="font-mono text-white">{invoiceNum}</span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-gray-300 space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Payment ID:</span>
                <span className="text-emerald-400 font-bold">{paidStatus.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID:</span>
                <span className="text-white">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-emerald-400 font-semibold">CAPTURED & RECONCILED</span>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = '/')}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition flex items-center justify-center space-x-2 border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-blue-300 uppercase tracking-wider">Amount Due</span>
                <span className="text-2xl font-black text-white">₹{amountNum.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex flex-col space-y-1 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Merchant:</span>
                  <span className="font-medium text-white">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Invoice Ref:</span>
                  <span className="font-mono text-blue-400">{invoiceNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reason:</span>
                  <span className="text-gray-200">{desc}</span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handlePayNow}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#305EFF] to-[#4F78FF] hover:from-[#254EDD] hover:to-[#3F68FF] text-white font-bold text-base rounded-xl shadow-lg shadow-[#305EFF]/40 transition transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Launching Razorpay SDK...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{amountNum.toLocaleString('en-IN')} with Razorpay</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-400 pt-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted · Razorpay Test Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
