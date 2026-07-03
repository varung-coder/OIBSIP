import Inventory from '../models/Inventory.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find({}).sort({ category: 1, name: 1 });
    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req, res, next) => {
  const { id } = req.params;
  const { quantity, threshold, price } = req.body;

  try {
    const item = await Inventory.findById(id);
    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found.');
    }

    if (quantity !== undefined) {
      if (quantity < 0) {
        res.status(400);
        throw new Error('Quantity cannot be negative.');
      }
      item.quantity = quantity;
    }

    if (threshold !== undefined) {
      if (threshold < 0) {
        res.status(400);
        throw new Error('Threshold cannot be negative.');
      }
      item.threshold = threshold;
    }

    if (price !== undefined) {
      if (price < 0) {
        res.status(400);
        throw new Error('Price cannot be negative.');
      }
      item.price = price;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: `Inventory item "${item.name}" updated successfully.`,
      item,
    });
  } catch (error) {
    next(error);
  }
};
