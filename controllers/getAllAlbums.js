const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const getAlbums = asyncHandler(async (req, res) => {
    const { limit = 5, offset = 0, artist_id, hidden } = req.query;

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
                a.album_id, 
                a.name AS album_name, 
                a.year, 
                a.hidden, 
                ar.name AS artist_name
            FROM 
                Albums a
            INNER JOIN Artists ar ON a.artist_id = ar.artist_id
        `;

        const queryParams = [];

        const whereClauses = [];
        if (artist_id) {
            whereClauses.push('a.artist_id = @artistId');
            queryParams.push({ name: 'artistId', type: sql.UniqueIdentifier, value: artist_id });
        }
        if (hidden !== undefined) {
            whereClauses.push('a.hidden = @hidden');
            queryParams.push({ name: 'hidden', type: sql.Bit, value: hidden === 'true' });
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        query += ` ORDER BY a.name OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

        const request = pool.request();
        queryParams.forEach(param => request.input(param.name, param.type, param.value));

        const result = await request.query(query);
        const albums = result.recordset;

        res.status(200).json({
            status: 200,
            data: albums,
            message: 'Albums retrieved successfully.',
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

module.exports = getAlbums;