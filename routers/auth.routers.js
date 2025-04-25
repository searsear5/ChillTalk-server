const express = require('express')
const router = express.Router()
const { register, login, getCurrentUser } = require('../controllers/auth.controller')
const { authMid } = require('../middleware/auth.middleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMid, getCurrentUser)

module.exports = router