const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const getAlbum = asyncHandler(async (req, res) => {
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

        const getAlbumQuery = `
            SELECT 
                a.album_id, 
                a.name AS album_name, 
                a.year, 
                a.hidden, 
                ar.name AS artist_name
            FROM 
                Albums a
            INNER JOIN Artists ar ON a.artist_id = ar.artist_id
            WHERE a.album_id = @albumId
        `;

        const result = await pool.request()
            .input('albumId', sql.UniqueIdentifier, album_id)
            .query(getAlbumQuery);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Album not found.',
                error: null,
            });
        }

        const album = result.recordset[0];

        res.status(200).json({
            status: 200,
            data: album,
            message: 'Album retrieved successfully.',
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

module.exports = getAlbum;