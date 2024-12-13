const express = require('express')
const signup = require('./controllers/signup')
const login = require('./controllers/login')
const addUser = require('./controllers/addUser')
const getUsers = require('./controllers/getUsers')
const logout = require('./controllers/logout')
const deleteUser = require('./controllers/deleteUser')
const updatePassword = require('./controllers/updatePassword')
const router = express.Router()

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/users/add-user').post(addUser)
router.route('/users').get(getUsers)
router.route('/logout').get(logout)
router.route('/users/:user_id').delete(deleteUser)
router.route('/users/update-password').put(updatePassword)

module.exports = router