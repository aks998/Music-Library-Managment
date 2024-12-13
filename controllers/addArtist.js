const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

const router = express.Router();

const addArtist = asyncHandler(async (req, res) => {
  const { name, grammy, hidden } = req.body;

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

    const artistId = crypto.randomUUID();

    const insertArtistQuery = `
      INSERT INTO Artists (artist_id, name, grammy, hidden) 
      VALUES (@artistId, @name, @grammy, @hidden)`;

    await pool.request()
      .input('artistId', sql.UniqueIdentifier, artistId)
      .input('name', sql.VarChar, name)
      .input('grammy', sql.Bit, grammy ? 1 : 0) 
      .input('hidden', sql.Bit, hidden ? 1 : 0) 
      .query(insertArtistQuery);

    res.status(201).json({
      status: 201,
      data: null,
      message: 'Artist created successfully.',
      error: null,
    });

  } catch (error) {
    console.error("Add Artist error:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
      error: error.message, 
    });
  }
});

module.exports = addArtist;