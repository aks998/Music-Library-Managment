const express = require('express')
const app = express()
const port = 8080
const connection = require('./connection/sqlDBConnection')

connection.connect((err) => {
    if(err) {
        console.error(`Unable to connect to the database ${err.message}`)
    }
    else console.log('Connected to database successfully')
})

app.get('/' , (req , res) => {
    res.send("Hello world")
})

app.listen(port , () => {
    console.log(`Listening on port ${port}`)
})
