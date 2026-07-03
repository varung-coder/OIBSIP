import express from 'express';
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminCancelOrder,
  adminGetDashboardStats,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// User Order actions
router.post('/', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

// Admin Console actions
router.get('/admin/all', protect, adminOnly, adminGetAllOrders);
router.put('/admin/status/:id', protect, adminOnly, adminUpdateOrderStatus);
router.put('/admin/cancel/:id', protect, adminOnly, adminCancelOrder);
router.get('/admin/dashboard-stats', protect, adminOnly, adminGetDashboardStats);

export default router;
