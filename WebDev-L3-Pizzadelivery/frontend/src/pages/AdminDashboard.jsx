import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiTrendingUp, FiActivity, FiUsers, FiAlertTriangle, FiCheckCircle, FiEdit2, FiX, FiSearch, FiRefreshCw, FiGrid, FiCompass, FiTruck } from 'react-icons/fi';

const AdminDashboard = () => {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'inventory', 'orders'
  
  // Dashboard Metrics & Charts
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  
  // Inventory State
  const [inventoryList, setInventoryList] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // Item currently being edited
  const [editForm, setEditForm] = useState({ quantity: 0, threshold: 0, price: 0 });

  // Orders State
  const [allOrders, setAllOrders] = useState([]);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersFilter, setOrdersFilter] = useState('all'); // 'all', 'received', 'kitchen', 'delivery', 'delivered', 'cancelled'

  const [loading, setLoading] = useState(true);

  // Fetch Dashboard Stats & Inventory Lists
  const fetchData = async () => {
    try {
      // 1. Fetch Stats & Aggregates
      const statsRes = await api.get('/orders/admin/dashboard-stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setSalesTrend(statsRes.data.charts.salesTrend);
        setRecentOrders(statsRes.data.recentOrders);
      }

      // 2. Fetch inventory list
      const invRes = await api.get('/inventory');
      if (invRes.data.success) {
        setInventoryList(invRes.data.items);
      }

      // 3. Fetch all orders
      const ordersRes = await api.get('/orders/admin/all');
      if (ordersRes.data.success) {
        setAllOrders(ordersRes.data.orders);
      }
    } catch (error) {
      console.error(error);
      toast('Failed to load admin dashboard resources.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  // Update Inventory Item
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await api.put(`/inventory/${editingItem._id}`, {
        quantity: parseInt(editForm.quantity),
        threshold: parseInt(editForm.threshold),
        price: parseFloat(editForm.price),
      });

      if (res.data.success) {
        toast(res.data.message, 'success');
        setEditingItem(null);
        // Refresh local data
        fetchData();
      }
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to update item.', 'error');
    }
  };

  // Change Order Status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/admin/status/${orderId}`, { status: newStatus });
      if (res.data.success) {
        toast(res.data.message, 'success');
        // Refresh local data
        fetchData();
      }
    } catch (error) {
      toast('Failed to update status.', 'error');
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This will refund ingredients.')) return;

    try {
      const res = await api.put(`/orders/admin/cancel/${orderId}`);
      if (res.data.success) {
        toast(res.data.message, 'success');
        fetchData();
      }
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to cancel order.', 'error');
    }
  };

  // Filters orders
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch = 
      order._id.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(ordersSearch.toLowerCase());
    
    if (ordersFilter === 'all') return matchesSearch;
    return matchesSearch && order.status === ordersFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-extrabold text-slate-500">Loading admin operations panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header and Sync */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            PizzaPilot Admin Console 🛠️
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            Track metrics, restock ingredients, audit orders, and toggle status pipelines.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchData();
          }}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:border-brand/40 hover:text-brand transition-colors w-max"
        >
          <FiRefreshCw className="w-3.5 h-3.5" /> Sync Data
        </button>
      </div>

      {/* Admin tab buttons */}
      <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200/20 dark:border-slate-800/20 w-full md:w-max">
        {[
          { id: 'analytics', name: 'Dashboard Analytics', icon: FiTrendingUp },
          { id: 'inventory', name: 'Inventory Management', icon: FiGrid },
          { id: 'orders', name: 'Order Console', icon: FiCompass },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ACTIVE PANEL CONTENT */}

      {/* PANEL 1: ANALYTICS & TRENDS */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* Metrics Grid Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: REVENUE */}
            <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 bg-gradient-to-br from-rose-500/5 to-rose-500/0">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Gross Revenue</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-white">₹{stats.revenue}</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                  <FiTrendingUp className="w-3.5 h-3.5" /> +12%
                </span>
              </div>
            </div>

            {/* CARD 2: ORDERS */}
            <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Total Orders</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats.totalOrders}</span>
              </div>
            </div>

            {/* CARD 3: PENDING & USERS */}
            <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Pending / Users</span>
              <div className="mt-2 flex items-baseline justify-between w-full">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  {stats.pendingOrders} <span className="text-xs text-slate-400">active</span>
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {stats.activeUsers} Users
                </span>
              </div>
            </div>

            {/* CARD 4: INVENTORY WARNINGS */}
            <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Stock Alerts</span>
              <div className="mt-2 flex items-center gap-3">
                <span className={`text-3xl font-extrabold ${stats.inventoryAlerts > 0 ? 'text-amber-500' : 'text-slate-800 dark:text-white'}`}>
                  {stats.inventoryAlerts}
                </span>
                {stats.inventoryAlerts > 0 && (
                  <span className="text-[9px] font-extrabold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <FiAlertTriangle className="w-3 h-3" /> Restock Req.
                  </span>
                )}
              </div>
            </div>
            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Sales bar chart using raw CSS/Tailwind */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Recent Daily Sales Trends</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-semibold">Graph showing sales volumes for the last 7 days</p>
              </div>

              {salesTrend.length > 0 ? (
                <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-t border-slate-400 h-px w-full" />
                    <div className="border-t border-slate-400 h-px w-full" />
                    <div className="border-t border-slate-400 h-px w-full" />
                  </div>

                  {salesTrend.map((trend) => {
                    const maxVal = Math.max(...salesTrend.map((t) => t.sales), 1);
                    const percentage = (trend.sales / maxVal) * 100;
                    
                    return (
                      <div key={trend._id} className="flex flex-col items-center flex-grow group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute top-[-35px] bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 w-max">
                          ₹{trend.sales} ({trend.count} ord)
                        </div>
                        
                        {/* Bar */}
                        <div
                          className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-brand to-rose-400 group-hover:from-rose-500 group-hover:to-rose-600 transition-all shadow-sm cursor-pointer"
                          style={{ height: `${Math.max(10, percentage * 1.5)}px` }}
                        />

                        {/* Date Label */}
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 block">
                          {trend._id.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold">No recent transactional trends compiled.</span>
                </div>
              )}
            </div>

            {/* Low stock critical warnings list */}
            <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                <FiAlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Alerts
              </h3>
              
              {inventoryList.filter(i => i.quantity < i.threshold).length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inventoryList.filter(i => i.quantity < i.threshold).map((item) => (
                    <div
                      key={item._id}
                      className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25 rounded-2xl flex justify-between items-center"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-rose-500 block">{item.quantity} units</span>
                        <span className="text-[9px] text-slate-400 block font-semibold">Limit: {item.threshold}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-emerald-500/20 rounded-2xl bg-emerald-500/5">
                  <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-emerald-600">Stock Levels Healthy</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">No low stock thresholds triggered.</p>
                </div>
              )}
            </div>

          </div>

          {/* Recent Orders Overview */}
          <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Recent Transactions</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 font-extrabold uppercase">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">User Details</th>
                    <th className="py-3 px-2">Total Paid</th>
                    <th className="py-3 px-2">Items</th>
                    <th className="py-3 px-2">Live Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50 font-semibold text-slate-700 dark:text-slate-300">
                  {recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30">
                      <td className="py-3 px-2 font-bold text-slate-800 dark:text-white">#{ord._id.slice(-8).toUpperCase()}</td>
                      <td className="py-3 px-2">
                        <div>{ord.user?.name}</div>
                        <div className="text-[10px] text-slate-400">{ord.user?.email}</div>
                      </td>
                      <td className="py-3 px-2 text-brand font-bold">₹{ord.priceBreakdown.total}</td>
                      <td className="py-3 px-2 max-w-[200px] truncate">
                        {ord.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3 px-2 uppercase text-[10px] font-bold text-brand">{ord.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 2: INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Table list */}
          <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-glass space-y-4">
            
            {editingItem && (
              <div className="p-5 bg-brand/5 border border-brand/20 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold text-brand uppercase tracking-wider">
                    Update Stock Parameters: "{editingItem.name}"
                  </h3>
                  <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                <form onSubmit={handleUpdateItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Available Quantity</label>
                    <input
                      type="number"
                      required
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restock Threshold</label>
                    <input
                      type="number"
                      required
                      value={editForm.threshold}
                      onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Commit Stock Changes
                  </button>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 font-extrabold uppercase">
                    <th className="py-3 px-2">Ingredient Name</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">In Stock</th>
                    <th className="py-3 px-2">Threshold</th>
                    <th className="py-3 px-2">Price (₹)</th>
                    <th className="py-3 px-2">Last Updated</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50 font-semibold text-slate-700 dark:text-slate-300">
                  {inventoryList.map((item) => {
                    const isLow = item.quantity < item.threshold;
                    return (
                      <tr key={item._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30">
                        <td className="py-3 px-2 font-bold text-slate-800 dark:text-white">{item.name}</td>
                        <td className="py-3 px-2 uppercase text-[10px] text-slate-400">{item.category}</td>
                        <td className="py-3 px-2">
                          <span className={isLow ? 'text-rose-500 font-extrabold' : 'text-slate-800 dark:text-white'}>
                            {item.quantity} units
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500">{item.threshold}</td>
                        <td className="py-3 px-2 font-bold text-brand">₹{item.price}</td>
                        <td className="py-3 px-2 text-slate-400 font-medium">
                          {new Date(item.lastUpdated || item.updatedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setEditForm({ quantity: item.quantity, threshold: item.threshold, price: item.price });
                            }}
                            className="inline-flex items-center gap-1.5 py-1 px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:text-brand dark:hover:bg-slate-700 dark:hover:text-brand rounded-lg transition-all"
                          >
                            <FiEdit2 className="w-3 h-3" /> Update Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 3: ORDERS CONSOLE */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-100/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/20 dark:border-slate-800/20">
            <div className="relative w-full md:max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search ID, user name or email..."
                value={ordersSearch}
                onChange={(e) => setOrdersSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
              {['all', 'received', 'kitchen', 'delivery', 'delivered', 'cancelled'].map((flt) => (
                <button
                  key={flt}
                  onClick={() => setOrdersFilter(flt)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    ordersFilter === flt
                      ? 'bg-brand border-brand text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List cards */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-glass grid grid-cols-1 lg:grid-cols-12 gap-6 items-start hover:border-brand/10 transition-all"
                >
                  
                  {/* Info column */}
                  <div className="lg:col-span-3 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Receipt Ref</span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">#{order._id.toUpperCase()}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      Date: {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-brand font-extrabold mt-1">
                      Billing total: ₹{order.priceBreakdown.total}
                    </p>
                  </div>

                  {/* Customer details */}
                  <div className="lg:col-span-3 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Recipient Profile</span>
                    <div className="text-xs font-bold text-slate-800 dark:text-white mt-1">{order.user?.name}</div>
                    <div className="text-[10px] text-slate-500">{order.user?.email}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{order.deliveryPhone}</div>
                    <div className="text-[10px] text-slate-400 leading-relaxed font-semibold max-w-[200px] truncate mt-0.5" title={order.deliveryAddress}>
                      Addr: {order.deliveryAddress}
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="lg:col-span-3 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Order Items</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          • {it.name} x {it.quantity}
                          <div className="text-[9px] text-slate-400 font-medium pl-2.5">
                            C: {it.base} | S: {it.sauce}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status update controls */}
                  <div className="lg:col-span-3 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Tracking Operations</span>
                    
                    {order.status === 'cancelled' ? (
                      <span className="inline-block text-[10px] font-extrabold bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full uppercase border border-rose-500/20">
                        Cancelled
                      </span>
                    ) : order.status === 'delivered' ? (
                      <span className="inline-block text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full uppercase border border-emerald-500/20">
                        Delivered Successfully
                      </span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {/* Selector */}
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-slate-400 font-extrabold">STATUS:</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand"
                          >
                            <option value="received">Received</option>
                            <option value="kitchen">In Kitchen</option>
                            <option value="delivery">Out For Delivery</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                        
                        {/* Cancel trigger */}
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="py-1 px-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[10px] font-extrabold uppercase rounded-lg transition-all text-center w-full"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-100/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <span className="text-4xl inline-block mb-3">📋</span>
              <p className="text-xs text-slate-400 font-semibold">No orders matching search keywords or status filters.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
