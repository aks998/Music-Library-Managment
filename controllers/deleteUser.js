const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');

const router = express.Router();

const deleteUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params; 

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      data: null,
      message: 'Unauthorized Access',
      error: null,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded.role !== 'Admin') {
      return res.status(403).json({
        status: 403,
        data: null,
        message: 'Forbidden Access',
        error: null,
      });
    }

    const pool = await connectToDatabase();

    const getUserQuery = `SELECT role FROM Users WHERE user_id = @userId`;
    const getUserResult = await pool.request()
      .input('userId', sql.UniqueIdentifier, user_id)
      .query(getUserQuery);

    if (getUserResult.recordset.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'User not found.',
        error: null,
      });
    }

    const userRole = getUserResult.recordset[0].role;

    if (userRole === 'Admin') {
      return res.status(403).json({
        status: 403,
        data: null,
        message: 'Forbidden Access', 
        error: null,
      });
    }

    const deleteUserQuery = `DELETE FROM Users WHERE user_id = @userId`;
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, user_id)
      .query(deleteUserQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'User not found.',
        error: null,
      });
    }

    res.status(200).json({
      status: 200,
      data: null,
      message: 'User deleted successfully.',
      error: null,
    });

  } catch (error) {
    console.error("Delete User error:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message, 
    });
  }
});

module.exports = deleteUser;