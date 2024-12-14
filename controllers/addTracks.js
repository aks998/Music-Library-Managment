const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

const router = express.Router();

const addTrack = asyncHandler(async (req, res) => {
    const { artist_id, album_id, name, duration, hidden } = req.body;

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

        const checkArtistAndAlbumQuery = `
            SELECT COUNT(*) AS artistCount, COUNT(*) AS albumCount
            FROM Artists a
            INNER JOIN Albums b ON a.artist_id = b.artist_id
            WHERE a.artist_id = @artistId AND b.album_id = @albumId
        `;

        const result = await pool.request()
            .input('artistId', sql.UniqueIdentifier, artist_id)
            .input('albumId', sql.UniqueIdentifier, album_id)
            .query(checkArtistAndAlbumQuery);

        if (result.recordset[0].artistCount === 0 || result.recordset[0].albumCount === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Artist or album not found.',
                error: null,
            });
        }

        const trackId = crypto.randomUUID();

        const insertTrackQuery = `
            INSERT INTO Tracks (track_id, name, duration, album_id, hidden)
            VALUES (@trackId, @name, @duration, @albumId, @hidden)
        `;

        await pool.request()
            .input('trackId', sql.UniqueIdentifier, trackId)
            .input('name', sql.VarChar, name)
            .input('duration', sql.Int, duration)
            .input('albumId', sql.UniqueIdentifier, album_id)
            .input('hidden', sql.Bit, hidden ? 1 : 0)
            .query(insertTrackQuery);

        res.status(201).json({
            status: 201,
            data: null,
            message: 'Track created successfully.',
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

module.exports = addTrack;