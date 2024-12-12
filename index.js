const express = require('express')
const app = express()
const port = 8080
const createTables = require('./db/tables')

createTables()

app.get('/' , (req , res) => {
    res.send("Hello world")
})

app.listen(port , () => {
    console.log(`Listening on port ${port}`)
})
