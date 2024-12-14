const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const deleteTrack = asyncHandler(async (req, res) => {
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

        // Retrieve the track name before deletion
        const getTrackQuery = `SELECT name FROM Tracks WHERE track_id = @trackId`;
        const trackResult = await pool.request()
            .input('trackId', sql.UniqueIdentifier, track_id)
            .query(getTrackQuery);

        if (trackResult.recordset.length === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Track not found.',
                error: null,
            });
        }

        const trackName = trackResult.recordset[0].name;

        // Delete the track
        const deleteTrackQuery = `DELETE FROM Tracks WHERE track_id = @trackId`;
        const deleteResult = await pool.request()
            .input('trackId', sql.UniqueIdentifier, track_id)
            .query(deleteTrackQuery);

        if (deleteResult.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Track not found.',
                error: null,
            });
        }

        res.status(200).json({
            status: 200,
            data: {
                track_id: track_id
            },
            message: `Track ${trackName} deleted successfully.`,
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

module.exports = deleteTrack;