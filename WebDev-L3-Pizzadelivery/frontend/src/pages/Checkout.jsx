import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiCreditCard, FiMapPin, FiPhone, FiShoppingCart, FiLoader } from 'react-icons/fi';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const checkoutItems = location.state?.items || [];
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: '',
      phone: '',
    }
  });

  // Dynamically load Razorpay SDK Checkout script
  useEffect(() => {
    const loadScript = async () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        setRazorpayLoaded(false);
        console.error('Failed to load Razorpay Checkout SDK script.');
      };
      document.body.appendChild(script);
    };

    if (checkoutItems.length > 0) {
      loadScript();
    }
  }, [checkoutItems]);

  // If cart is empty, show empty state
  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-4 animate-float">🛒</span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Checkout Cart is Empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed font-semibold">
          You haven't selected any pizza options to order yet. Let's build a delicious pie!
        </p>
        <button
          onClick={() => navigate('/builder')}
          className="mt-6 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95"
        >
          Go to Pizza Builder
        </button>
      </div>
    );
  }

  // Calculate pricing summary details
  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryFee;

  const handleProcessPayment = async (data) => {
    if (!razorpayLoaded) {
      toast('Razorpay Checkout SDK is still loading. Please try again in a few seconds.', 'warning');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order record on the backend
      const orderPayload = {
        items: checkoutItems,
        deliveryAddress: data.address,
        deliveryPhone: data.phone,
      };

      const res = await api.post('/orders', orderPayload);
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to initiate order.');
      }

      const { razorpayOrder, orderId } = res.data;

      // 2. Open Razorpay Checkout Modal (or simulate payment in Developer Sandbox Mode)
      if (razorpayOrder.key === 'rzp_test_placeholder_key') {
        toast('Sandbox Mode: Simulating payment portal verification...', 'info');
        setTimeout(async () => {
          try {
            const verificationPayload = {
              razorpayOrderId: razorpayOrder.id,
              razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
              razorpaySignature: 'mock_signature_abc123',
            };

            const verifyRes = await api.post('/orders/verify', verificationPayload);
            if (verifyRes.data.success) {
              toast('Sandbox Payment Completed! Order is now received by the kitchen.', 'success');
              navigate(`/tracker/${verifyRes.data.order._id}`);
            } else {
              toast('Sandbox payment verification failed.', 'error');
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast(verifyErr.response?.data?.message || 'Payment simulation failed.', 'error');
          } finally {
            setLoading(false);
          }
        }, 1500);
        return;
      }

      // Otherwise, open real Razorpay Checkout Modal
      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'PizzaPilot Platform',
        description: `Order Receipt ID: ${orderId}`,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=80&h=80&q=80',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          setLoading(true);
          try {
            // Verify payment on the backend
            const verificationPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const verifyRes = await api.post('/orders/verify', verificationPayload);
            if (verifyRes.data.success) {
              toast('Payment successful! PizzaPilot is now preparing your order.', 'success');
              navigate(`/tracker/${verifyRes.data.order._id}`);
            } else {
              toast('Payment verification failed on server.', 'error');
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast(verifyErr.response?.data?.message || 'Payment verification failed.', 'error');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: data.phone,
        },
        theme: {
          color: '#F43F5E',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment gateway cancelled by user.', 'info');
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();

    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || err.message || 'Checkout initiation failed.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Review & Secure Checkout 🔒
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Finalize your shipping address and process simulated payments via Razorpay Test Mode.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ORDER ITEM DETAILS & COST BREAKDOWN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Item Summaries */}
          <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FiShoppingCart className="w-5 h-5 text-brand" /> Selected Items Summary
            </h3>
            
            <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="py-4 flex justify-between items-start gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{item.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      Crust: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.base}</span> • 
                      Sauce: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.sauce}</span>
                    </p>
                    {item.cheese.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        Cheese: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.cheese.join(', ')}</span>
                      </p>
                    )}
                    {item.vegetables.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        Veggies: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.vegetables.join(', ')}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-500 block">Qty: {item.quantity}</span>
                    <span className="text-sm font-extrabold text-brand block mt-0.5">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Billing */}
          <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Price Breakdown</h3>
            
            <div className="space-y-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-slate-700 dark:text-slate-300">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (18%):</span>
                <span className="text-slate-700 dark:text-slate-300">₹{tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {deliveryFee === 0 ? <span className="text-emerald-500 font-extrabold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              
              <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3 flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-800 dark:text-white">Total Billable Amount:</span>
                <span className="text-brand text-lg">₹{total}</span>
              </div>
            </div>

            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed border border-slate-200/30 dark:border-slate-800/30">
              * Delivery time is estimated around <span className="font-extrabold text-slate-800 dark:text-white">35-45 minutes</span> from payment dispatch.
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DELIVERY INPUTS & ACTION BUTTONS */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-6">Delivery Details</h3>

            <form onSubmit={handleSubmit(handleProcessPayment)} className="space-y-4">
              {/* Shipping Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Delivery Address
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 text-slate-400">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <textarea
                    rows={3}
                    {...register('address', { required: 'Delivery address is required' })}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-xs font-semibold leading-relaxed ${
                      errors.address ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    placeholder="Enter complete house address, area, and pincode..."
                  />
                </div>
                {errors.address && (
                  <span className="text-rose-500 text-[10px] font-semibold mt-1 block">
                    {errors.address.message}
                  </span>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Contact Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiPhone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Contact number is required',
                      pattern: {
                        value: /^[6789]\d{9}$/,
                        message: 'Enter a valid 10-digit mobile number',
                      },
                    })}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-xs font-semibold ${
                      errors.phone ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    placeholder="e.g. 9876543210"
                  />
                </div>
                {errors.phone && (
                  <span className="text-rose-500 text-[10px] font-semibold mt-1 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              {/* Checkout buttons */}
              <button
                type="submit"
                disabled={loading || !razorpayLoaded}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-premium-hover active:scale-[0.98]"
              >
                {loading ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Checkout with Razorpay <FiCreditCard className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
