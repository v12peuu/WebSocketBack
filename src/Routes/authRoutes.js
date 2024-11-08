// routes/authRoutes.js

const express = require('express');
const usersController = require('../Controllers/userscontroller');
const apiLimiter = require('../Middleware/rateLimiter');

const router = express.Router();

// Rota de registro
router.post('/register',  usersController.register);

// Rota de login
router.post('/login',  usersController.login);

module.exports = router;
