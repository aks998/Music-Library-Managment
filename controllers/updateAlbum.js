const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const updateAlbum = asyncHandler(async (req, res) => {
    const { album_id } = req.params;
    const { name, year, hidden } = req.body;

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

        const updateAlbumQuery = `
            UPDATE Albums
            SET 
                name = COALESCE(@name, name),
                year = COALESCE(@year, year),
                hidden = COALESCE(@hidden, hidden)
            WHERE album_id = @albumId
        `;

        const queryParams = [
            { name: 'albumId', type: sql.UniqueIdentifier, value: album_id },
        ];

        if (name !== undefined) {
            queryParams.push({ name: 'name', type: sql.VarChar, value: name });
        }
        if (year !== undefined) {
            queryParams.push({ name: 'year', type: sql.Int, value: year });
        }
        if (hidden !== undefined) {
            queryParams.push({ name: 'hidden', type: sql.Bit, value: hidden ? 1 : 0 });
        }

        const request = pool.request();
        queryParams.forEach(param => request.input(param.name, param.type, param.value));

        const result = await request.query(updateAlbumQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Album not found.',
                error: null,
            });
        }

        res.status(204).send();

    } catch (error) {
        return res.status(401).json({
            status: 401,
            data: null,
            message: 'Unauthorized Access',
            error: null,
        });
    }
});

module.exports = updateAlbum;