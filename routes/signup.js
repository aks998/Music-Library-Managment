// const express = require('express');
// const bcrypt = require('bcrypt');
// const router = express.Router()
// const sql = require('mssql');
// const connectToDatabase = require('../db/sqlDBConnection');

// router.post('/', async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         const missingFields = [];
//         if (!email) missingFields.push('email');
//         if (!password) missingFields.push('password');
//         return res.status(400).json({
//             status: 400,
//             data: null,
//             message: `Bad Request, Reason: Missing Field(s) ${missingFields.join(', ')}`,
//             error: null
//         });
//     }

//     try {
//         const pool = await connectToDatabase();

//         const existingUser = await pool.request()
//         .input('email', sql.NVarChar, email)
//         .query('SELECT * FROM Users WHERE email = @email');

//         console.log("PASSED THIS BARRIER")
//         if (existingUser.recordset.length > 0) {
//             return res.status(409).json({
//                 status: 409,
//                 data: null,
//                 message: "Email already exists.",
//                 error: null
//             });
//         }

//         const usersCount = await pool.request()
//             .query('SELECT COUNT(*) AS count FROM Users');
//         const isFirstUser = usersCount.recordset[0].count === 0;

//         const hashedPassword = await bcrypt.hash(password, 10);

//         await pool.request()
//             .input('email', sql.VarChar, email)
//             .input('password', sql.VarChar, hashedPassword)
//             .input('role', sql.VarChar, isFirstUser ? 'admin' : 'viewer')
//             .query('INSERT INTO Users (email, password, role) VALUES (@email, @password, @role)');
//         return res.status(201).json({
//             status: 201,
//             data: null,
//             message: "User created successfully.",
//             error: null
//         });
//     } catch (err) {
//         return res.status(500).json({
//             status: 500,
//             data: null,
//             message: "Internal Server Error",
//             error: null
//         });
//     }
// });

// module.exports = router;