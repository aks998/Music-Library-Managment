const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const getTrack = asyncHandler(async (req, res) => {
    const { track_id } = req.params;

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

        const getTrackQuery = `
            SELECT 
                t.track_id, 
                t.name AS track_name, 
                t.duration, 
                t.hidden, 
                ar.name AS artist_name, 
                al.name AS album_name
            FROM 
                Tracks t
            INNER JOIN Albums al ON t.album_id = al.album_id
            INNER JOIN Artists ar ON al.artist_id = ar.artist_id
            WHERE t.track_id = @trackId
        `;

        const result = await pool.request()
            .input('trackId', sql.UniqueIdentifier, track_id)
            .query(getTrackQuery);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Track not found.',
                error: null,
            });
        }

        const track = result.recordset[0];

        res.status(200).json({
            status: 200,
            data: track,
            message: 'Track retrieved successfully.',
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

module.exports = getTrack;