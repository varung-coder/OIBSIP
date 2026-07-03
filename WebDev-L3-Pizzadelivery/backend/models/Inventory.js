import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'vegetable'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    threshold: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update lastUpdated date before saving if quantity changes
inventorySchema.pre('save', function (next) {
  if (this.isModified('quantity')) {
    this.lastUpdated = new Date();
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
