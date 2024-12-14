const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const getFavorites = asyncHandler(async (req, res) => {
    const { category, limit = 5, offset = 0 } = req.params;

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

        let getFavoritesQuery;
        if (category === 'artist') {
            getFavoritesQuery = `
                SELECT f.favorite_id , a.name AS item_name, f.created_at
                FROM Favorites f
                INNER JOIN Artists a ON f.artist_id = a.artist_id
                WHERE f.user_id = @userId
                ORDER BY f.created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `;
        } else if (category === 'album') {
            getFavoritesQuery = `
                SELECT f.favorite_id, al.name AS item_name, f.created_at
                FROM Favorites f
                INNER JOIN Albums al ON f.album_id = al.album_id
                WHERE f.user_id = @userId
                ORDER BY f.created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `;
        } else if (category === 'track') {
            getFavoritesQuery = `
                SELECT f.favorite_id, t.name AS item_name, f.created_at
                FROM Favorites f
                INNER JOIN Tracks t ON f.track_id = t.track_id
                WHERE f.user_id = @userId
                ORDER BY f.created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `;
        }

        const favoritesResult = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('category', sql.VarChar, category)
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset)
            .query(getFavoritesQuery);

        const favorites = favoritesResult.recordset;

        res.status(200).json({
            status: 200,
            data: favorites,
            message: 'Favorites retrieved successfully.',
            error: null,
        });

    } catch (error) {
        console.error('Error retrieving favorites:', error);
        return res.status(500).json({
            status: 500,
            data: null,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

module.exports = getFavorites;