const express = require('express')
const signup = require('./routes/signup')
const login = require('./routes/login')
const addUser = require('./routes/addUser')
const router = express.Router()

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/users/add-user').post(addUser)

module.exports = router