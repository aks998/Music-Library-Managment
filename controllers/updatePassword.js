const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const updateUserPassword = asyncHandler(async (req, res) => {
  const { old_password, new_password } = req.body;

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

    const pool = await connectToDatabase();

    const getUserQuery = `SELECT * FROM Users WHERE email = @email`;
    const getUserResult = await pool.request()
      .input('email', sql.VarChar, decoded.email)
      .query(getUserQuery);

    if (getUserResult.recordset.length === 0) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'User not found.',
        error: null,
      });
    }

    const user = getUserResult.recordset[0];

    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: 'Incorrect old password.',
        error: null,
      });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    const updateUserQuery = `UPDATE Users SET password = @newPassword WHERE email = @email`;
    await pool.request()
      .input('email', sql.VarChar, decoded.email)
      .input('newPassword', sql.VarChar, hashedNewPassword)
      .query(updateUserQuery);

    res.status(204).send();

  } catch (error) {
    return res.status(401).json({
      status: 401,
      data: null,
      message: 'Unauthorized Access',
      error: null,
    });
  }
});

module.exports = updateUserPassword;