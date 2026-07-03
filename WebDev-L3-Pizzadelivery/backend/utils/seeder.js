import User from '../models/User.js';
import Inventory from '../models/Inventory.js';

const initialInventory = [
  // Bases (Exactly 5)
  { name: 'Thin Crust', category: 'base', quantity: 50, threshold: 10, price: 80 },
  { name: 'Cheese Burst', category: 'base', quantity: 35, threshold: 10, price: 150 },
  { name: 'Stuffed Crust', category: 'base', quantity: 40, threshold: 10, price: 130 },
  { name: 'Whole Wheat', category: 'base', quantity: 45, threshold: 10, price: 90 },
  { name: 'Pan Crust', category: 'base', quantity: 50, threshold: 10, price: 100 },

  // Sauces (Exactly 5)
  { name: 'Classic Tomato', category: 'sauce', quantity: 60, threshold: 15, price: 20 },
  { name: 'Spicy Marinara', category: 'rose', category: 'sauce', quantity: 50, threshold: 15, price: 25 },
  { name: 'Creamy Garlic Alfredo', category: 'sauce', quantity: 40, threshold: 15, price: 35 },
  { name: 'Smoky BBQ', category: 'sauce', quantity: 45, threshold: 15, price: 30 },
  { name: 'Basil Pesto', category: 'sauce', quantity: 30, threshold: 15, price: 40 },

  // Cheeses (Multiple Selection)
  { name: 'Mozzarella', category: 'cheese', quantity: 70, threshold: 20, price: 50 },
  { name: 'Cheddar', category: 'cheese', quantity: 50, threshold: 15, price: 60 },
  { name: 'Parmesan', category: 'cheese', quantity: 40, threshold: 10, price: 70 },
  { name: 'Feta', category: 'cheese', quantity: 30, threshold: 10, price: 65 },

  // Vegetables (Multiple Selection)
  { name: 'Bell Peppers', category: 'vegetable', quantity: 80, threshold: 20, price: 15 },
  { name: 'Red Onions', category: 'vegetable', quantity: 90, threshold: 20, price: 10 },
  { name: 'Mushrooms', category: 'vegetable', quantity: 60, threshold: 15, price: 25 },
  { name: 'Black Olives', category: 'vegetable', quantity: 50, threshold: 15, price: 20 },
  { name: 'Jalapeños', category: 'vegetable', quantity: 55, threshold: 15, price: 20 },
  { name: 'Sweet Corn', category: 'vegetable', quantity: 75, threshold: 20, price: 15 },
];

export const seedDatabase = async () => {
  try {
    // 1. Seed Inventory
    for (const item of initialInventory) {
      const exists = await Inventory.findOne({ name: item.name });
      if (!exists) {
        // Safe check for syntax-error fields
        const cleanedItem = {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          threshold: item.threshold,
          price: item.price
        };
        await Inventory.create(cleanedItem);
        console.log(`[SEED] Seeded inventory item: ${item.name}`);
      }
    }

    // 2. Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzapilot.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPilot@123';

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'PizzaPilot Admin',
        email: adminEmail,
        password: adminPassword, // Will automatically trigger the pre-save bcrypt hash
        role: 'admin',
        isVerified: true,
      });
      console.log(`[SEED] Seeded Admin User: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`[SEED] Database seeding failed: ${error.message}`);
  }
};
