const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

const router = express.Router();

const addFavorite = asyncHandler(async (req, res) => {
    const { category, item_id } = req.body;

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
        const userEmail = decoded.email;

        const pool = await connectToDatabase();

        // Retrieve user ID from the database based on email
        const getUserQuery = `SELECT user_id FROM Users WHERE email = @email`;
        const userResult = await pool.request()
            .input('email', sql.VarChar, userEmail)
            .query(getUserQuery);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'User not found.',
                error: null,
            });
        }

        const userId = userResult.recordset[0].user_id;

        if (!['artist', 'album', 'track'].map(c => c.toLowerCase()).includes(category.toLowerCase())) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Invalid category.',
                error: null,
            });
        }

        const favoriteId = crypto.randomUUID();

        const insertFavoriteQuery = `
            INSERT INTO Favorites (favorite_id, user_id, artist_id, album_id, track_id, created_at)
            VALUES (@favorite_id, @userId,
                    CASE WHEN @category = 'artist' THEN @item_id ELSE NULL END,
                    CASE WHEN @category = 'album' THEN @item_id ELSE NULL END,
                    CASE WHEN @category = 'track' THEN @item_id ELSE NULL END,
                    GETDATE())
        `;

        await pool.request()
            .input('favorite_id', sql.UniqueIdentifier, favoriteId)
            .input('userId', sql.UniqueIdentifier, userId)
            .input('category', sql.VarChar, category)
            .input('item_id', sql.UniqueIdentifier, item_id)
            .query(insertFavoriteQuery);

        res.status(201).json({
            status: 201,
            data: null,
            message: 'Favorite added successfully.',
            error: null,
        });

    } catch (error) {
        console.error('Error adding favorite:', error);
        return res.status(500).json({
            status: 500,
            data: null,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

module.exports = addFavorite;