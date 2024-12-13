const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler')


const login = asyncHandler(async (req, res) => {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
    const { email, password } = req.body;
    if (!email || !password) {
        const missingFields = [];
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");

        return res.status(400).json({
            status: 400,
            data: null,
            message: `Bad Request, Reason:${missingFields.join(', ')}`,
            error: null
        });
    }

    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query(`SELECT * FROM Users WHERE email = '${email}'`);
        const user = result.recordset[0];

        if (!user) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: "User not found.",
                error: null
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: "Bad Request, Reason: Incorrect Password",
                error: null
            });
        }

        const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({
            status: 200,
            data: {
                token: token
            },
            message: "Login successful.",
            error: null
        });
    } catch (err) {
        console.log(err)
    }
});

module.exports = login;