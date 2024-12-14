const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const addAlbum = asyncHandler(async (req, res) => {
    const { artist_id, name, year, hidden } = req.body;

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

        const checkArtistQuery = `SELECT * FROM Artists WHERE artist_id = @artistId`;
        const artistResult = await pool.request()
            .input('artistId', sql.UniqueIdentifier, artist_id)
            .query(checkArtistQuery);

        if (artistResult.recordset.length === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Artist not found.',
                error: null,
            });
        }

        const albumId = uuidv4();

        const insertAlbumQuery = `
            INSERT INTO Albums (album_id, name, year, artist_id, hidden)
            VALUES (@albumId, @name, @year, @artistId, @hidden)
        `;

        await pool.request()
            .input('albumId', sql.UniqueIdentifier, albumId)
            .input('name', sql.VarChar, name)
            .input('year', sql.Int, year)
            .input('artistId', sql.UniqueIdentifier, artist_id)
            .input('hidden', sql.Bit, hidden ? 1 : 0)
            .query(insertAlbumQuery);

        res.status(201).json({
            status: 201,
            data: null,
            message: 'Album created successfully.',
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

module.exports = addAlbum;