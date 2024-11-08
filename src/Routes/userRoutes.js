// routes/userRoutes.js

const express = require('express');
const usersController = require('../Controllers/userscontroller'); // Verifique se o caminho está correto
const { authenticate } = require('../Middleware/authMiddleware'); // Certifique-se de que o middleware existe e está corretamente importado

const router = express.Router();

// Rota para obter informações do usuário logado
router.get('/me',  usersController.getUser);

// // Rota para buscar todos os usuários
router.get('/',  usersController.findAll);

module.exports = router;
