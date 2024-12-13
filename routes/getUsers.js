const jwt = require('jsonwebtoken');
const connectToDatabase = require('../db/sqlDBConnection');
const asyncHandler = require('express-async-handler');

const getUsers = asyncHandler(async (req, res) => {
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; 
  const { limit = 5, offset = 0, role } = req.query; 

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
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    if (decoded.role !== 'Admin') {
      return res.status(401).json({
        status: 401,
        data: null,
        message: 'Unauthorized Access (Requires Admin Role)',
        error: null,
      });
    }

    const pool = await connectToDatabase();

    const query = `
      SELECT * FROM Users
      ${role ? `WHERE role = '${role}'` : ''}
      ORDER BY created_at ASC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY; 
    `;

    const result = await pool.request().query(query);
    const users = result.recordset;

    res.status(200).json({
      status: 200,
      data: users,
      message: 'Users retrieved successfully.',
      error: null,
    });

  } catch (error) {
    console.error(error);
  }
});

module.exports = getUsers;