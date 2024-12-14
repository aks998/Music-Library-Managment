const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const getTracks = asyncHandler(async (req, res) => {
    const { limit = 5, offset = 0, artist_id, album_id, hidden } = req.query;

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

        let query = `
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
        `;

        const queryParams = [];

        const whereClauses = [];
        if (artist_id) {
            whereClauses.push('ar.artist_id = @artistId');
            queryParams.push({ name: 'artistId', type: sql.UniqueIdentifier, value: artist_id });
        }
        if (album_id) {
            whereClauses.push('al.album_id = @albumId');
            queryParams.push({ name: 'albumId', type: sql.UniqueIdentifier, value: album_id });
        }
        if (hidden !== undefined) {
            whereClauses.push('t.hidden = @hidden');
            queryParams.push({ name: 'hidden', type: sql.Bit, value: hidden === 'true' });
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        query += ` ORDER BY t.name OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

        const request = pool.request();
        queryParams.forEach(param => request.input(param.name, param.type, param.value));

        const result = await request.query(query);
        const tracks = result.recordset;

        res.status(200).json({
            status: 200,
            data: tracks,
            message: 'Tracks retrieved successfully.',
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

module.exports = getTracks;