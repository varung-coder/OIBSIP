import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['verification', 'reset'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Expires after 1 hour (3600 seconds)
  },
});

// Build index for TTL expiration
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const Token = mongoose.model('Token', tokenSchema);
export default Token;
