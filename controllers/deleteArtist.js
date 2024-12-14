const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const deleteArtist = asyncHandler(async (req, res) => {
    const { artist_id } = req.params;

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

        const getArtistQuery = `SELECT name FROM Artists WHERE artist_id = @artistId`;
        const artistResult = await pool.request()
            .input('artistId', sql.UniqueIdentifier, artist_id)
            .query(getArtistQuery);

        if (artistResult.recordset.length === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Artist not found.',
                error: null,
            });
        }

        const artistName = artistResult.recordset[0].name;

        const deleteArtistQuery = `DELETE FROM Artists WHERE artist_id = @artistId`;
        const deleteResult = await pool.request()
            .input('artistId', sql.UniqueIdentifier, artist_id)
            .query(deleteArtistQuery);

        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Artist not found.',
                error: null,
            });
        }

        res.status(200).json({
            status: 200,
            data: {
                artist_id: artist_id
            },
            message: `Artist ${artistName} deleted successfully.`,
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

module.exports = deleteArtist