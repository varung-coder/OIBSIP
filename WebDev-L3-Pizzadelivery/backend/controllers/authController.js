import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Token from '../models/Token.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

// Helper to generate JWT Token
const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'pizzapilot_jwt_secret_key_98765';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '7d', // 7 days expiration
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email address.');
    }

    // Create user (pre-save hook hashes password)
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
    });

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await Token.create({
      user: user._id,
      token: verificationToken,
      type: 'verification',
    });

    // Send email
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      previewUrl: emailResult.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;
  const { email } = req.query;

  try {
    const tokenRecord = await Token.findOne({ token, type: 'verification' });
    if (!tokenRecord) {
      // Bypasses React strict mode double-run issues:
      // If the token was already consumed/deleted, check if the email user is already verified!
      if (email) {
        const alreadyVerifiedUser = await User.findOne({ email });
        if (alreadyVerifiedUser && alreadyVerifiedUser.isVerified) {
          return res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
          });
        }
      }
      res.status(400);
      throw new Error('Invalid or expired verification token.');
    }

    const user = await User.findById(tokenRecord.user);
    if (!user) {
      res.status(400);
      throw new Error('User account associated with this token not found.');
    }

    user.isVerified = true;
    await user.save();

    // Delete token after successful verification
    await Token.deleteOne({ _id: tokenRecord._id });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    if (!user.isVerified) {
      // Re-send verification link if they tried to log in unverified
      let tokenRecord = await Token.findOne({ user: user._id, type: 'verification' });
      let verificationToken;
      
      if (tokenRecord) {
        verificationToken = tokenRecord.token;
      } else {
        verificationToken = crypto.randomBytes(32).toString('hex');
        await Token.create({
          user: user._id,
          token: verificationToken,
          type: 'verification',
        });
      }

      const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

      res.status(403);
      return next(new Error(`Account not verified. A verification link has been sent to your email. Verification Preview Link: ${emailResult.previewUrl || ''}`));
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      res.status(400);
      throw new Error('Please enter your registered email address.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      // We don't want to disclose user existence in production, but for testing we return success to stay secure.
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Clean up older reset tokens
    await Token.deleteMany({ user: user._id, type: 'reset' });

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    await Token.create({
      user: user._id,
      token: resetToken,
      type: 'reset',
    });

    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent! Check your inbox.',
      previewUrl: emailResult.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      res.status(400);
      throw new Error('Token and new password are required.');
    }

    const tokenRecord = await Token.findOne({ token, type: 'reset' });
    if (!tokenRecord) {
      res.status(400);
      throw new Error('Invalid or expired reset token.');
    }

    const user = await User.findById(tokenRecord.user);
    if (!user) {
      res.status(400);
      throw new Error('User associated with this token no longer exists.');
    }

    user.password = password; // Will automatically pre-save hash
    await user.save();

    // Delete token
    await Token.deleteOne({ _id: tokenRecord._id });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
