import cron from 'node-cron';
import Inventory from '../models/Inventory.js';
import { sendLowStockAlertEmail } from '../services/emailService.js';

// Cache to prevent duplicate alert spamming for identical stock values
const lastAlertedStock = {};

export const initCronJobs = () => {
  // Cron schedule: Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Checking inventory stock levels...');
    try {
      // Find items where quantity is below threshold
      const lowStockItems = await Inventory.find({
        $expr: { $lt: ['$quantity', '$threshold'] },
      });

      if (lowStockItems.length === 0) {
        console.log('[CRON] Inventory status healthy. No items below threshold.');
        return;
      }

      const itemsToAlert = [];
      for (const item of lowStockItems) {
        const itemIdStr = item._id.toString();
        const prevQty = lastAlertedStock[itemIdStr];
        
        // Alert if we haven't alerted yet or if the quantity has changed
        if (prevQty === undefined || prevQty !== item.quantity) {
          itemsToAlert.push(item);
          lastAlertedStock[itemIdStr] = item.quantity;
        }
      }

      if (itemsToAlert.length > 0) {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzapilot.com';
        console.log(`[CRON] Triggered! Sending low stock email alert to Admin (${adminEmail}) for ${itemsToAlert.length} items.`);
        await sendLowStockAlertEmail(adminEmail, itemsToAlert);
      } else {
        console.log('[CRON] Warning items exist, but alert was already sent for current levels.');
      }
    } catch (error) {
      console.error(`[CRON ERROR] Failed inventory checks: ${error.message}`);
    }
  });

  console.log('[CRON] Scheduled inventory-monitor jobs registered.');
};
