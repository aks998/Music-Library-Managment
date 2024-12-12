const sql = require('mssql')
require('dotenv').config();

const connectionString = process.env.CONNECTION_STRING

let connection

const connectToDatabase = async() =>
{
    if(!connection) {
        try {
            connection = await sql.connect(connectionString)
                .then(pool => {
                    console.log('Connected to Database successful!');   
                    return pool;
                })
        } catch (err) {
            console.error('Error connecting to the database:', err.message);
        }
        return connection
    }
}

module.exports = connectToDatabase