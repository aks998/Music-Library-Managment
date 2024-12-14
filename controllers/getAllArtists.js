const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

const router = express.Router();

// Get All Artists
const getArtists = asyncHandler(async (req, res) => {
  const { limit = 5, offset = 0, grammy, hidden } = req.query;

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
    jwt.verify(token, process.env.JWT_SECRET_KEY); 

    const pool = await connectToDatabase();

    let query = `SELECT artist_id, name, grammy, hidden FROM Artists`;
    const queryParams = [];

    const whereClauses = [];
    if (grammy !== undefined) {
      whereClauses.push(`grammy = @grammy`);
      queryParams.push({ name: 'grammy', type: sql.Int, value: parseInt(grammy) });
    }
    if (hidden !== undefined) {
      whereClauses.push(`hidden = @hidden`);
      queryParams.push({ name: 'hidden', type: sql.Bit, value: hidden === 'true' });
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ` ORDER BY name OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const request = pool.request();
    queryParams.forEach(param => request.input(param.name, param.type, param.value));

    const result = await request.query(query);
    const artists = result.recordset;

    res.status(200).json({
      status: 200,
      data: artists,
      message: 'Artists retrieved successfully.',
      error: null,
    });

  } catch (error) {
    return res.status(401).json({
      status: 401,
      data: null,
      message: 'Unauthorized Access',
      error: null,
    });
  }
});

module.exports = getArtists