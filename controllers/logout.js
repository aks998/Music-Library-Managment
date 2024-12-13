const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: 'No token provided', 
      error: null,
    });
  }

  try {
    res.status(200).json({
      status: 200,
      data: null,
      message: 'User logged out successfully.',
      error: null,
    });
  } catch (error) {
    console.error("Logout error:", error); 
  }
});

module.exports = logout;