const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const removeFavorite = asyncHandler(async (req, res) => {
    const { favorite_id } = req.params;

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

        // Delete the favorite
        const deleteFavoriteQuery = `
            DELETE FROM Favorites
            WHERE favorite_id = @favoriteId AND user_id = @userId
        `;

        const deleteResult = await pool.request()
            .input('favoriteId', sql.UniqueIdentifier, favorite_id)
            .input('userId', sql.UniqueIdentifier, userId)
            .query(deleteFavoriteQuery);

        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Favorite not found or unauthorized.',
                error: null,
            });
        }

        res.status(200).json({
            status: 200,
            data: null,
            message: 'Favorite removed successfully.',
            error: null,
        });

    } catch (error) {
        console.error('Error removing favorite:', error);
        return res.status(500).json({
            status: 500,
            data: null,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

module.exports = removeFavorite;