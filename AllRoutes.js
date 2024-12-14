const express = require('express')
const signup = require('./controllers/signup')
const login = require('./controllers/login')
const addUser = require('./controllers/addUser')
const getUsers = require('./controllers/getUsers')
const logout = require('./controllers/logout')
const deleteUser = require('./controllers/deleteUser')
const updatePassword = require('./controllers/updatePassword')
const getAllArtists = require('./controllers/getAllArtists')
const getArtist = require('./controllers/getArtist')
const addArtist = require('./controllers/addArtist')
const updateArtist = require('./controllers/updateArtists')
const deleteArtist = require('./controllers/deleteArtist')
const addAlbum = require('./controllers/addAlbum')
const getAllAlbums = require('./controllers/getAllAlbums')
const getAlbum = require('./controllers/getAlbum')
const updateAlbum = require('./controllers/updateAlbum')
const deleteAlbum = require('./controllers/deleteAlbum')
const addTrack = require('./controllers/addTracks')
const getAllTracks = require('./controllers/getAllTracks')
const getTrack = require('./controllers/getTrack')
const updateTrack = require('./controllers/updateTrack')
const deleteTrack = require('./controllers/deleteTrack')
const addFavorite = require('./controllers/addFavorite')
const getFavorites = require('./controllers/getFavorite')
const deleteFavorite = require('./controllers/deleteFavorite')
const router = express.Router()

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/users/add-user').post(addUser)
router.route('/users').get(getUsers)
router.route('/logout').get(logout)
router.route('/users/:user_id').delete(deleteUser)
router.route('/users/update-password').put(updatePassword)
router.route('/artists').get(getAllArtists)
router.route('/artists/:artist_id').get(getArtist).put(updateArtist).delete(deleteArtist)
router.route('/artists/add-artist').post(addArtist)
router.route('/albums/add-album').post(addAlbum)
router.route('/albums').get(getAllAlbums)
router.route('/albums/:album_id').get(getAlbum).put(updateAlbum).delete(deleteAlbum)
router.route('/tracks/add-track').post(addTrack)
router.route('/tracks').get(getAllTracks)
router.route('/tracks/:track_id').get(getTrack).put(updateTrack).delete(deleteTrack)
router.route('/favorites/add-favorite').post(addFavorite)
router.route('/favorites/:category').get(getFavorites)
router.route('/favorites/remove-favorite/:favorite_id').delete(deleteFavorite)
module.exports = router