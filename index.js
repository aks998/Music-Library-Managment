const express = require('express')
const app = express()
const port = 8080
const createTables = require('./db/tables')
app.use(express.json());

createTables()

app.get('/' , (req , res) => {
    console.log("THE IP ADDRESS " , req.ip)
    res.send("Hello world")
})

app.listen(port , () => {
    console.log(`Listening on port ${port}`)
})

app.use('/' , require('./AllRoutes'))