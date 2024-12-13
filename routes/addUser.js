const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sql = require('mssql')
const crypto = require('crypto')
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler')

const addUser = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 401,
            data: null,
            message: "Unauthorized Access",
            error: null
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (decoded.role !== 'admin') {
            return res.status(403).json({
                status: 403,
                data: null,
                message: "Forbidden Access/Operation not allowed.",
                error: null
            });
        }

        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: "Bad Request",
                error: null
            });
        }

        if (role === 'admin') {
            return res.status(403).json({
                status: 403,
                data: null,
                message: "Forbidden Access/Operation not allowed.",
                error: null
            });
        }
        const pool = await connectToDatabase();
        const existingUserQuery = `SELECT * FROM Users WHERE email = @email`;
        const existingUser = await pool.request()
            .input('email', sql.VarChar, email)
            .query(existingUserQuery);

        if (existingUser.recordset.length > 0) {
            return res.status(409).json({
                status: 409,
                data: null,
                message: "Email already exists.",
                error: null
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = `
            INSERT INTO Users (user_id, email, password, role) 
            VALUES (@userId, @email, @password, @role)
        `;
        const userId = crypto.randomUUID();

        await pool.request()
            .input('userId', sql.VarChar, userId)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('role', sql.VarChar, role)
            .query(insertUserQuery);

        return res.status(201).json({
            status: 201,
            data: null,
            message: "User created successfully.",
            error: null
        });
    } catch (err) {
        console.log(err)
    }
});

module.exports = addUser;