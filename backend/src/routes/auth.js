const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const AuthController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be 8 or more characters").isLength({
      min: 8,
    }),
  ],
  AuthController.registerUser
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  AuthController.loginUser
);

// @route   GET api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get("/me", authMiddleware, AuthController.getCurrentUser);

// @route   POST api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post(
  "/verify-email",
  [check("token", "Verification token is required").not().isEmpty()],
  AuthController.verifyEmail
);

// @route   POST api/auth/resend-verification
// @desc    Resend email verification token
// @access  Public
router.post(
  "/resend-verification",
  [check("email", "Please include a valid email").isEmail()],
  AuthController.resendVerificationEmail
);

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  "/forgot-password",
  [check("email", "Please include a valid email").isEmail()],
  AuthController.forgotPassword
);

// @route   POST api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post(
  "/reset-password",
  [
    check("token", "Reset token is required").not().isEmpty(),
    check("password", "Password must be 8 or more characters").isLength({
      min: 8,
    }),
  ],
  AuthController.resetPassword
);

// @route   PUT api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put("/update-profile", authMiddleware, AuthController.updateUserProfile);

// @route   PUT api/auth/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  [
    authMiddleware,
    check("currentPassword", "Current password is required").exists(),
    check("newPassword", "New password must be 8 or more characters").isLength({
      min: 8,
    }),
  ],
  AuthController.changePassword
);

module.exports = router;

