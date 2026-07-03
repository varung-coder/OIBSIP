import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { socket } from '../utils/socket';
import { useToast } from '../context/ToastContext';
import { FiCheckCircle, FiClock, FiShoppingBag, FiTruck, FiAlertCircle, FiChevronRight, FiMapPin, FiPhone } from 'react-icons/fi';

const statusSteps = [
  { status: 'received', title: 'Order Received', desc: 'Awaiting kitchen confirmation', icon: FiClock },
  { status: 'kitchen', title: 'In Kitchen', desc: 'Preparing crust & toppings', icon: FiShoppingBag },
  { status: 'delivery', title: 'Out For Delivery', desc: 'Pilot is en route to you', icon: FiTruck },
  { status: 'delivered', title: 'Delivered', desc: 'Enjoy your warm pizza!', icon: FiCheckCircle },
];

const OrderTracker = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (error) {
        console.error(error);
        toast('Failed to load order tracking details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, toast]);

  // Handle Socket.IO connection and subscription
  useEffect(() => {
    if (!id) return;

    socket.connect();

    // Join room
    socket.emit('join_order', id);

    // Listen for updates
    socket.on('order_status_updated', (data) => {
      if (data.orderId === id) {
        setOrder((prev) => {
          if (!prev) return null;
          return { ...prev, status: data.status };
        });
        toast(`Order status updated to: ${data.status.toUpperCase()}`, 'info');
      }
    });

    return () => {
      socket.emit('leave_order', id);
      socket.off('order_status_updated');
      socket.disconnect();
    };
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-extrabold text-slate-500">Connecting live tracking board...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-6">
        <FiAlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          The order tracking link is invalid or you do not have permissions to view this receipt.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Get index of current status
  const currentStepIdx = statusSteps.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          My Orders <FiChevronRight className="w-3.5 h-3.5" /> Track order
        </Link>
      </div>

      {/* Tracker Card */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/40 dark:border-white/5 space-y-8">
        
        {/* Receipt Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
          <div>
            <span className="text-[10px] font-extrabold text-brand uppercase tracking-widest block">Live Status Board</span>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              Order #{order._id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 block uppercase">Payment Status</span>
            <span className="mt-1 inline-block text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
              {order.paymentStatus === 'paid' ? 'Paid (Razorpay)' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Live Timeline progress */}
        {isCancelled ? (
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-400">
            <FiAlertCircle className="w-6 h-6 shrink-0 animate-pulse" />
            <div>
              <h4 className="text-sm font-extrabold">Order Cancelled</h4>
              <p className="text-xs font-semibold leading-relaxed mt-0.5 opacity-90">
                This order was cancelled by the administrator. Any processed payments will be refunded.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6">
            {/* Horizontal Timeline Tracker */}
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
              
              {/* Desktop Connecting Progress Line */}
              <div className="hidden md:block absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 z-0">
                <div
                  className="h-full bg-brand transition-all duration-700 ease-in-out"
                  style={{
                    width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {statusSteps.map((step, idx) => {
                const IconComponent = step.icon;
                const isCompleted = idx <= currentStepIdx;
                const isActive = idx === currentStepIdx;

                return (
                  <div key={step.status} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 flex-grow text-left md:text-center w-full md:w-auto">
                    
                    {/* Circle Node */}
                    <div
                      className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-brand border-rose-200 dark:border-rose-900 text-white shadow-premium-hover scale-110'
                          : isCompleted
                          ? 'bg-brand border-transparent text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Step descriptions */}
                    <div>
                      <h4
                        className={`text-xs font-extrabold uppercase tracking-wide transition-colors ${
                          isCompleted ? 'text-slate-800 dark:text-white' : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {/* Delivery Address Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/20 dark:border-slate-800/20 text-slate-700 dark:text-slate-300">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FiMapPin className="w-4 h-4 text-brand" /> Delivery Address
            </h4>
            <p className="text-xs font-semibold leading-relaxed">
              {order.deliveryAddress}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FiPhone className="w-4 h-4 text-brand" /> Recipient Contact
            </h4>
            <p className="text-xs font-bold">
              {order.deliveryPhone}
            </p>
          </div>
        </div>

        {/* Order Items Review */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Receipt Details</h4>
          
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {item.name}
                  </span>{' '}
                  <span className="text-slate-400 font-medium">x {item.quantity}</span>
                </div>
                <span className="font-extrabold text-slate-700 dark:text-slate-300">₹{item.price * item.quantity}</span>
              </div>
            ))}
            
            <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-3 flex justify-between items-center text-sm font-extrabold">
              <span className="text-slate-800 dark:text-white">Grand Total Amount Paid:</span>
              <span className="text-brand">₹{order.priceBreakdown.total}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTracker;
