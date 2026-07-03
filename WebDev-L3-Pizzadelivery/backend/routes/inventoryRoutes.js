import express from 'express';
import { getInventory, updateInventoryItem } from '../controllers/inventoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInventory);
router.put('/:id', protect, adminOnly, updateInventoryItem);

export default router;
