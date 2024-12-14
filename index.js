const express = require('express')
const app = express()
const port = 8080
const createTables = require('./db/tables')
app.use(express.json());

createTables()

app.get('/' , (req , res) => {
    res.send("Hello and Welcome to Music Library Management")
})

app.listen(port , () => {
    console.log(`Listening on port ${port}`)
})

app.use('/' , require('./AllRoutes'))