import crypto from 'crypto';
import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import { getRazorpayInstance } from '../config/razorpay.js';
import { emitOrderUpdate, emitNewOrderAlert } from '../socket/socketHandler.js';

// Helper to verify and deduct ingredient stock
const verifyAndDeductStock = async (items) => {
  const ingredientsNeeded = {};

  for (const item of items) {
    const qty = item.quantity || 1;

    if (item.base) {
      ingredientsNeeded[item.base] = (ingredientsNeeded[item.base] || 0) + qty;
    }
    if (item.sauce) {
      ingredientsNeeded[item.sauce] = (ingredientsNeeded[item.sauce] || 0) + qty;
    }
    if (item.cheese && Array.isArray(item.cheese)) {
      for (const ch of item.cheese) {
        ingredientsNeeded[ch] = (ingredientsNeeded[ch] || 0) + qty;
      }
    }
    if (item.vegetables && Array.isArray(item.vegetables)) {
      for (const veg of item.vegetables) {
        ingredientsNeeded[veg] = (ingredientsNeeded[veg] || 0) + qty;
      }
    }
  }

  // 1. Verify availability
  for (const [name, reqQty] of Object.entries(ingredientsNeeded)) {
    const ingredient = await Inventory.findOne({ name });
    if (!ingredient) {
      throw new Error(`Ingredient "${name}" is not registered in our inventory database.`);
    }
    if (ingredient.quantity < reqQty) {
      throw new Error(`Insufficient stock for "${name}". Current inventory: ${ingredient.quantity}, Required: ${reqQty}`);
    }
  }

  // 2. Deduct levels
  for (const [name, reqQty] of Object.entries(ingredientsNeeded)) {
    await Inventory.findOneAndUpdate(
      { name },
      { $inc: { quantity: -reqQty } }
    );
  }
};

// @desc    Create new order & generate Razorpay Order ID
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const { items, deliveryAddress, deliveryPhone } = req.body;

  try {
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items specified in the order.');
    }
    if (!deliveryAddress || !deliveryPhone) {
      res.status(400);
      throw new Error('Please provide a delivery address and telephone contact.');
    }

    // 1. Verify stock before creating order
    // (This prevents locking screens or checkout forms for out-of-stock items)
    const ingredientsNeeded = {};
    for (const item of items) {
      const qty = item.quantity || 1;
      if (item.base) ingredientsNeeded[item.base] = (ingredientsNeeded[item.base] || 0) + qty;
      if (item.sauce) ingredientsNeeded[item.sauce] = (ingredientsNeeded[item.sauce] || 0) + qty;
      if (item.cheese && Array.isArray(item.cheese)) {
        item.cheese.forEach(ch => { ingredientsNeeded[ch] = (ingredientsNeeded[ch] || 0) + qty; });
      }
      if (item.vegetables && Array.isArray(item.vegetables)) {
        item.vegetables.forEach(veg => { ingredientsNeeded[veg] = (ingredientsNeeded[veg] || 0) + qty; });
      }
    }

    for (const [name, reqQty] of Object.entries(ingredientsNeeded)) {
      const ingredient = await Inventory.findOne({ name });
      if (!ingredient) {
        res.status(400);
        throw new Error(`Selected ingredient "${name}" is unavailable.`);
      }
      if (ingredient.quantity < reqQty) {
        res.status(400);
        throw new Error(`Low stock for "${name}". Please remove or adjust choices. Only ${ingredient.quantity} available.`);
      }
    }

    // 2. Calculate Pricing
    let subtotal = 0;
    for (const item of items) {
      let itemPrice = 0;
      // Get base price
      const baseObj = await Inventory.findOne({ name: item.base });
      if (baseObj) itemPrice += baseObj.price;

      // Get sauce price
      const sauceObj = await Inventory.findOne({ name: item.sauce });
      if (sauceObj) itemPrice += sauceObj.price;

      // Get cheese prices
      if (item.cheese && Array.isArray(item.cheese)) {
        for (const ch of item.cheese) {
          const chObj = await Inventory.findOne({ name: ch });
          if (chObj) itemPrice += chObj.price;
        }
      }

      // Get veggie prices
      if (item.vegetables && Array.isArray(item.vegetables)) {
        for (const veg of item.vegetables) {
          const vegObj = await Inventory.findOne({ name: veg });
          if (vegObj) itemPrice += vegObj.price;
        }
      }

      item.price = itemPrice; // update in payload
      subtotal += itemPrice * (item.quantity || 1);
    }

    const tax = Math.round(subtotal * 0.18); // 18% GST
    const deliveryFee = subtotal > 500 ? 0 : 50; // free delivery above Rs. 500
    const total = subtotal + tax + deliveryFee;

    // 3. Create Local Order record (paymentStatus = pending)
    const order = await Order.create({
      user: req.user._id,
      items,
      priceBreakdown: { subtotal, tax, deliveryFee, total },
      deliveryAddress,
      deliveryPhone,
      paymentStatus: 'pending',
      status: 'received',
    });

    // 4. Initialize Razorpay Order (with simulation bypass for developer ease)
    const isPlaceholder = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder');

    let razorpayOrder;
    if (isPlaceholder) {
      console.log('[RAZORPAY] Simulating order details (Developer Sandbox Mode)');
      razorpayOrder = {
        id: `order_mock_${Math.random().toString(36).substring(2, 10)}`,
        amount: Math.round(total * 100),
        currency: 'INR',
        key: 'rzp_test_placeholder_key',
      };
    } else {
      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        res.status(400);
        throw new Error('Razorpay credentials missing from server environment variables (.env). Real checkout is unavailable.');
      }

      const options = {
        amount: Math.round(total * 100), // convert to paisa
        currency: 'INR',
        receipt: `receipt_order_${order._id}`,
      };

      razorpayOrder = await razorpay.orders.create(options);
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      orderId: order._id,
      priceBreakdown: order.priceBreakdown,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: isPlaceholder ? 'rzp_test_placeholder_key' : process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('[ORDER ERROR] Failed to create order:', error);
    const msg = error.description || error.error?.description || error.message || 'Razorpay order creation failed.';
    res.status(error.statusCode || 400);
    next(new Error(`Order creation failed: ${msg}`));
  }
};

// @desc    Verify signature and complete purchase
// @route   POST /api/orders/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    if (!razorpayOrderId) {
      res.status(400);
      throw new Error('Payment payload parameters missing.');
    }

    const isMock = razorpayOrderId.startsWith('order_mock_');

    if (isMock) {
      console.log('[RAZORPAY] Simulating payment verification (Developer Sandbox Mode)');
      const order = await Order.findOne({ razorpayOrderId }).populate('user', 'name email');
      if (!order) {
        res.status(404);
        throw new Error('Order associated with this payment not found.');
      }

      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
      order.razorpaySignature = razorpaySignature || 'mock_signature_abc123';
      await order.save();

      // Deduct stock upon verified purchase
      await verifyAndDeductStock(order.items);

      // Notify sockets
      emitNewOrderAlert(order);
      emitOrderUpdate(order._id, 'received');

      return res.status(200).json({
        success: true,
        message: 'Sandbox Payment completed and verified successfully!',
        order,
      });
    }

    // Otherwise, execute real payment signature validation
    if (!razorpayPaymentId || !razorpaySignature) {
      res.status(400);
      throw new Error('Payment verification parameters missing.');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      res.status(500);
      throw new Error('Razorpay Secret key is missing on the server config.');
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      // Find order and mark as failed
      await Order.findOneAndUpdate({ razorpayOrderId }, { paymentStatus: 'failed' });
      res.status(400);
      throw new Error('Razorpay signature mismatch. Payment verification failed.');
    }

    // Update local order
    const order = await Order.findOne({ razorpayOrderId }).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order associated with this payment not found.');
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    // Deduct stock upon verified purchase
    await verifyAndDeductStock(order.items);

    // Notify sockets
    emitNewOrderAlert(order);
    emitOrderUpdate(order._id, 'received');

    res.status(200).json({
      success: true,
      message: 'Payment completed and verified successfully!',
      order,
    });
  } catch (error) {
    console.error('[VERIFY ERROR] Payment verification exception:', error);
    const msg = error.description || error.error?.description || error.message || 'Payment verification failed.';
    res.status(400);
    next(new Error(`Verification failed: ${msg}`));
  }
};

// @desc    Get current user orders list
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found.');
    }

    // Check ownership
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden. You do not have permissions to view this order.');
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const adminGetAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/admin/status/:id
// @access  Private/Admin
export const adminUpdateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = ['received', 'kitchen', 'delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid order status.');
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found.');
    }

    order.status = status;
    await order.save();

    // Broadcast status to socket connection
    emitOrderUpdate(order._id, status);

    res.status(200).json({
      success: true,
      message: `Order status changed to "${status}".`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Admin only)
// @route   PUT /api/orders/admin/cancel/:id
// @access  Private/Admin
export const adminCancelOrder = async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found.');
    }

    if (order.status === 'cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled.');
    }

    order.status = 'cancelled';
    await order.save();

    // Return ingredients to inventory
    for (const item of order.items) {
      const qty = item.quantity || 1;
      if (item.base) await Inventory.findOneAndUpdate({ name: item.base }, { $inc: { quantity: qty } });
      if (item.sauce) await Inventory.findOneAndUpdate({ name: item.sauce }, { $inc: { quantity: qty } });
      if (item.cheese && Array.isArray(item.cheese)) {
        for (const ch of item.cheese) {
          await Inventory.findOneAndUpdate({ name: ch }, { $inc: { quantity: qty } });
        }
      }
      if (item.vegetables && Array.isArray(item.vegetables)) {
        for (const veg of item.vegetables) {
          await Inventory.findOneAndUpdate({ name: veg }, { $inc: { quantity: qty } });
        }
      }
    }

    // Broadcast socket cancellation
    emitOrderUpdate(order._id, 'cancelled');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and ingredients returned to inventory.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics (Admin only)
// @route   GET /api/orders/admin/dashboard-stats
// @access  Private/Admin
export const adminGetDashboardStats = async (req, res, next) => {
  try {
    // 1. Core metric cards
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const pendingOrders = await Order.countDocuments({
      paymentStatus: 'paid',
      status: { $in: ['received', 'kitchen', 'delivery'] },
    });
    const completedOrders = await Order.countDocuments({
      paymentStatus: 'paid',
      status: 'delivered',
    });
    const activeUsers = await User.countDocuments({ role: 'user' });
    const inventoryAlerts = await Inventory.countDocuments({
      $expr: { $lt: ['$quantity', '$threshold'] },
    });

    // Revenue aggregation
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$priceBreakdown.total' } } },
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. Charts info - recent orders trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          sales: { $sum: '$priceBreakdown.total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Ingredient stock usage alerts
    const lowStockIngredients = await Inventory.find({
      $expr: { $lt: ['$quantity', '$threshold'] },
    }).sort({ quantity: 1 });

    // Recent orders table
    const recentOrders = await Order.find({ paymentStatus: 'paid' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        revenue,
        pendingOrders,
        completedOrders,
        activeUsers,
        inventoryAlerts,
      },
      charts: {
        salesTrend,
      },
      lowStockIngredients,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};
