const sql = require('mssql')
require('dotenv').config();

const connectionString = process.env.CONNECTION_STRING

const connectToDatabase = async() =>
{
    try {
        const connection = await sql.connect(connectionString);
        console.log('Connected to Database successful!');
        return connection
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    }
}

module.exports = connectToDatabase