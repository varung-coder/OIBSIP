import Razorpay from 'razorpay';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('[RAZORPAY] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Real payments will fail.');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('[RAZORPAY] Razorpay client initialized successfully.');
  } catch (error) {
    console.error(`[RAZORPAY ERROR] Failed to initialize Razorpay SDK: ${error.message}`);
  }

  return razorpayInstance;
};
