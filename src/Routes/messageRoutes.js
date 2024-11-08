// routes/messageRoutes.js

const express = require('express');
const usersController = require('../Controllers/userscontroller');
const { authenticate } = require('../Middleware/authMiddleware');

const router = express.Router();

// // Rota para enviar uma mensagem
router.post('/send', usersController.sendMessage);

// // Rota para obter o histórico de conversas entre dois usuários
router.get('/history', usersController.getConversationHistory);

module.exports = router;

