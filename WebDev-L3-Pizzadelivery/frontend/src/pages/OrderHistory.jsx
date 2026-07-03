import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiShoppingBag, FiArrowRight, FiClock, FiCheck, FiTruck, FiAlertCircle } from 'react-icons/fi';

const OrderHistory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (error) {
        console.error(error);
        toast('Failed to load your purchase history.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [toast]);

  const getStatusBadge = (order) => {
    let classes = 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    let label = 'Received';
    let Icon = FiClock;

    if (order.paymentStatus === 'pending') {
      classes = 'bg-amber-500/10 text-amber-600 border-amber-500/25';
      label = 'Awaiting Payment';
      Icon = FiClock;
    } else if (order.paymentStatus === 'failed') {
      classes = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      label = 'Payment Failed';
      Icon = FiAlertCircle;
    } else if (order.status === 'kitchen') {
      classes = 'bg-amber-500/10 text-amber-600 border-amber-500/25';
      label = 'Preparing';
      Icon = FiClock;
    } else if (order.status === 'delivery') {
      classes = 'bg-sky-500/10 text-sky-600 border-sky-500/25';
      label = 'Out for Delivery';
      Icon = FiTruck;
    } else if (order.status === 'delivered') {
      classes = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25';
      label = 'Delivered';
      Icon = FiCheck;
    } else if (order.status === 'cancelled') {
      classes = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      label = 'Cancelled';
      Icon = FiAlertCircle;
    }

    return (
      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded-full tracking-wider ${classes}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-extrabold text-slate-500">Loading purchase history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          My Order History 📦
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Access all past purchases, invoices, and active live tracking boards.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-glass space-y-4 hover:border-brand/20 transition-all"
            >
              {/* Order Info Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Date</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                  {getStatusBadge(order)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grand Total</span>
                  <span className="text-sm font-extrabold text-brand">
                    ₹{order.priceBreakdown.total}
                  </span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Items Purchased</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/30 dark:border-slate-800/30 text-xs font-semibold">
                      <div className="flex justify-between items-center font-bold text-slate-800 dark:text-white">
                        <span>{item.name}</span>
                        <span className="text-brand">₹{item.price * item.quantity}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        Crust: {item.base} • Qty: {item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="pt-2 flex justify-end">
                {order.paymentStatus === 'pending' ? (
                  <button
                    onClick={() => navigate('/checkout', { state: { items: order.items } })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Pay Now <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    to={`/tracker/${order._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Track Live Dispatch <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-3xl border border-slate-200/30 dark:border-slate-800/30">
          <FiShoppingBag className="mx-auto w-16 h-16 text-slate-300 dark:text-slate-700 mb-4 animate-float" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Orders Recorded</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            You haven't ordered any custom or signature pizzas yet. Place your first order today!
          </p>
          <Link
            to="/builder"
            className="mt-6 inline-block px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-extrabold rounded-xl transition-all shadow-md"
          >
            Open Pizza Builder
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
