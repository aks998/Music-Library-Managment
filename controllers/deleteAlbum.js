const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const deleteAlbum = asyncHandler(async (req, res) => {
    const { album_id } = req.params;

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

        // Retrieve the album name before deletion
        const getAlbumQuery = `SELECT name FROM Albums WHERE album_id = @albumId`;
        const albumResult = await pool.request()
            .input('albumId', sql.UniqueIdentifier, album_id)
            .query(getAlbumQuery);

        if (albumResult.recordset.length === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Album not found.',
                error: null,
            });
        }

        const albumName = albumResult.recordset[0].name;

        // Delete the album
        const deleteAlbumQuery = `DELETE FROM Albums WHERE album_id = @albumId`;
        const deleteResult = await pool.request()
            .input('albumId', sql.UniqueIdentifier, album_id)
            .query(deleteAlbumQuery);

        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Album not found.',
                error: null,
            });
        }

        res.status(200).json({
            status: 200,
            data: {
                album_id: album_id
            },
            message: `Album ${albumName} deleted successfully.`,
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

module.exports = deleteAlbum;