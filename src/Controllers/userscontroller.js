// controllers/usersController.js
const { User } = require('../Models/userModels');
const jwt = require('jsonwebtoken');
const { validateUsername, validatePassword, validateMessage } = require('../validators');
const rateLimit = require('express-rate-limit');
const userService = require('../Services/userService');
const messageService = require('../Services/messageService');
const apiLimiter = require('../Middleware/rateLimiter');

// Função para registrar um novo usuário
exports.register =  async (req, res) => {
    const { username, password } = req.body;

    if (!validateUsername(username) || !validatePassword(password)) {
        return res.status(400).json({ success: false, message: 'Dados de entrada inválidos.' });
    }

    try {
        const existingUser = await userService.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Usuário já existe.' });
        }

        const newUser = await userService.createUser(username, password);
        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!', data: newUser });
    } catch (error) {
        console.error("Erro ao registrar o usuário:", error);
        res.status(500).json({ success: false, message: 'Erro ao registrar o usuário.' });
    }
};

// Função para login do usuário
exports.login =  async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await userService.findUserByUsername(username);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Credenciais inválidas.' });
        }

        const isPasswordValid = await userService.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { username: user.username, id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
};

// Função para enviar uma mensagem
exports.sendMessage = async (req, res) => {
    const { senderId, recipientId, content } = req.body;

    try {
        // Verifica se o remetente existe
        const sender = await userService.findUserById(senderId);
        if (!sender) {
            return res.status(400).json({ success: false, message: 'Usuário remetente não encontrado.' });
        }

        // Verifica se o destinatário existe
        const recipient = await userService.findUserById(recipientId);
        if (!recipient) {
            return res.status(400).json({ success: false, message: 'Usuário destinatário não encontrado.' });
        }

        // Envia a mensagem
        const result = await messageService.sendMessage(senderId, recipientId, content);

        res.status(201).json({ success: true, message: 'Mensagem enviada com sucesso!', data: result });
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        res.status(500).json({ success: false, message: 'Erro ao enviar a mensagem.' });
    }
};

// Função para obter informações do usuário logado
exports.getUser = async (req, res) => {
    try {
        const userId = req.user.id; // Supõe que o ID do usuário logado está no req.user
        const user = userService.findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar informações do usuário.' });
    }
};

// Função para obter a lista de todos os usuários
exports.findAll = async (req, res) => {
    try {
        const users = [
            { id: 1, username: 'user1' },
            { id: 2, username: 'user2' },
        ]; // Lista de usuários de exemplo

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Erro ao buscar lista de usuários:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar lista de usuários.' });
    }
};

exports.getConversationHistory = async (req, res) => {
    const { userId1, userId2 } = req.params;

    // Verificar se os IDs estão presentes e válidos
    if (!userId1 || !userId2) {
        return res.status(400).json({ success: false, message: 'IDs dos usuários são obrigatórios.' });
    }

    try {
        // Chamada ao serviço para obter o histórico de mensagens
        const messages = await messageService.getMessageHistory(userId1, userId2);
        
        if (!messages) {
            return res.status(404).json({ success: false, message: 'Histórico de mensagens não encontrado.' });
        }
        
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Erro ao buscar histórico de mensagens:', error);
        
        // Melhor detalhamento no tratamento de erro
        if (error instanceof DatabaseError) {
            res.status(500).json({ success: false, message: 'Erro no banco de dados ao buscar histórico de mensagens.' });
        } else {
            res.status(500).json({ success: false, message: 'Erro ao buscar histórico de mensagens.' });
        }
    }
};
