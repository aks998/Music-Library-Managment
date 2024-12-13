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
    return res.status(401).send(); 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const pool = await connectToDatabase();

    const getUserQuery = `SELECT * FROM Users WHERE email = @email`;
    const getUserResult = await pool.request()
      .input('email', sql.VarChar, decoded.email) 
      .query(getUserQuery);

    if (getUserResult.recordset.length === 0) {
      return res.status(404).send(); 
    }

    const user = getUserResult.recordset[0];

    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) {
      return res.status(400).send(); 
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    const updateUserQuery = `UPDATE Users SET password = @newPassword WHERE email = @email`;
    await pool.request()
      .input('email', sql.VarChar, decoded.email)
      .input('newPassword', sql.VarChar, hashedNewPassword)
      .query(updateUserQuery);

    res.status(204).send(); // No content

  } catch (error) {
    console.error("Update Password error:", error);
  }
});

module.exports = updateUserPassword;