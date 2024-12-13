const express = require('express');
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const connectToDatabase = require('../db/sqlDBConnection');
const crypto = require('crypto')
const asyncHandler = require('express-async-handler')

const signup =  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log("EMAIL IS " , email , password)
    if (!email || !password) {
        const missingFields = [];
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        return res.status(400).json({
            status: 400,
            data: null,
            message: `Bad Request, Reason:${missingFields.join(', ')}`,
            error: null
        });
    }

    try {
        const pool = await connectToDatabase();

        const existingUserQuery = `SELECT * FROM Users WHERE email = @email`;
        const existingUserResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query(existingUserQuery);

        if (existingUserResult.recordset.length > 0) {
            return res.status(409).json({
                status: 409,
                data: null,
                message: "Email already exists.",
                error: null
            });
        }

        const usersCountQuery = 'SELECT COUNT(*) AS count FROM Users';
        const usersCountResult = await pool.request()
            .query(usersCountQuery);
        const isFirstUser = usersCountResult.recordset[0].count === 0;

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
        .input('role', sql.VarChar, isFirstUser ? 'Admin' : 'Viewer')
        .query(insertUserQuery);
        return res.status(201).json({
            status: 201,
            data: null,
            message: "User created successfully.",
            error: null
        });
    } catch (err) {
        console.error(err);
    }
});

module.exports = signup;