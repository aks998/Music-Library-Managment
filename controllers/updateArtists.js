const express = require('express');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const router = express.Router();

const updateArtist = asyncHandler(async (req, res) => {
    const { artist_id } = req.params;
    const { name, grammy, hidden } = req.body;

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

        const updateQuery = `
            UPDATE Artists
            SET 
                name = COALESCE(@name, name),
                grammy = COALESCE(@grammy, grammy),
                hidden = COALESCE(@hidden, hidden)
            WHERE artist_id = @artistId
        `;

        const queryParams = [
            { name: 'artistId', type: sql.UniqueIdentifier, value: artist_id },
        ];

        if (name !== undefined) {
            queryParams.push({ name: 'name', type: sql.VarChar, value: name });
        }
        if (grammy !== undefined) {
            queryParams.push({ name: 'grammy', type: sql.Bit, value: grammy ? 1 : 0 });
        }
        if (hidden !== undefined) {
            queryParams.push({ name: 'hidden', type: sql.Bit, value: hidden ? 1 : 0 });
        }

        const request = pool.request();
        queryParams.forEach(param => request.input(param.name, param.type, param.value));

        const result = await request.query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Artist not found.',
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

module.exports = updateArtist;