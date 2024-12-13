const sql = require('mssql')
require('dotenv').config();

const connectionString = process.env.CONNECTION_STRING

const connectToDatabase = async() =>
{
    try{
        const pool = sql.connect(connectionString)
        return pool
    }
    catch(err) {
        console.log("ERROR CONNECTING TO THE DATABASE " , err)
    }
}

module.exports = connectToDatabase