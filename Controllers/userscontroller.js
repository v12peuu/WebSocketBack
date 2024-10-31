const pool = require('../DataBase/db');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const messageModel = require('../Models/messageModels');
const { validateUsername, validatePassword, validateMessage } = require('../validators');
const rateLimit = require('express-rate-limit'); // Exemplo de rate limiting



const users = {};

// Middleware para rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP
    message: { success: false, message: 'Muitas requisições. Por favor, tente novamente mais tarde.' }
});

// Função para verificar JWT
const verifyJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Token inválido:', error);
        return null;
    }
};

// Registro de novo usuário 

exports.register = [apiLimiter, async (req, res) => {
    const { username, password } = req.body;

    // Validações de entrada para username e password
    if (!validateUsername(username) || !validatePassword(password)) {
        return res.status(400).json({ success: false, message: 'Dados de entrada inválidos.' });
    }

    try {
        // Verifica se o usuário já existe
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Usuário já existe.' });
        }

        // Hasheia a senha do usuário
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insere o novo usuário no banco de dados
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error("Erro ao registrar o usuário:", error);
        res.status(500).json({ success: false, message: 'Erro ao registrar o usuário.' });
    }
}];


// Login do usuário
exports.login = [apiLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Credenciais inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { username: user.rows[0].username, id: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
}];

// Buscar dados do usuário
exports.getUser = async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [req.user.username]);

        if (user.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        res.json({
            success: true,
            data: {
                id: user.rows[0].id,
                username: user.rows[0].username,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar usuário.' });
    }
};

// Buscar todos os usuários
exports.findAll = async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM users');
        res.json({ success: true, data: users.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar usuários.' });
    }
};

// Enviar mensagem de um usuário para outro
exports.sendMessage = async (req, res) => {
    const { recipient_id, msg } = req.body;
    const sender_id = req.user.id;

    if (!validateMessage(msg)) {
        return res.status(400).json({ success: false, message: 'Mensagem inválida.' });
    }

    try {
        const recipientUser = await pool.query('SELECT * FROM users WHERE id = $1', [recipient_id]);
        if (recipientUser.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Destinatário não encontrado.' });
        }

        const message = await messageModel.sendMessage(sender_id, recipient_id, msg);

        if (users[recipient_id]) {
            users[recipient_id].send(JSON.stringify({ from: sender_id, text: msg }));
        }

        res.status(201).json({ success: true, message: 'Mensagem enviada com sucesso!', data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao enviar a mensagem.' });
    }
};

// Registrar WebSocket
exports.registerWebSocket = (ws, token) => {
    const decodedToken = verifyJWT(token);
    if (!decodedToken) {
        ws.close();
        return;
    }

    const userID = decodedToken.id;
    users[userID] = ws;

    ws.on('message', async (message) => {
        try {
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.type === 'getHistory') {
                const { recipientId } = parsedMessage;
                const senderId = userID;

                const messageHistory = await messageModel.getMessageHistory(senderId, recipientId);

                ws.send(JSON.stringify({
                    type: 'history',
                    data: messageHistory,
                }));
            }

        } catch (error) {
            console.error('Erro ao processar mensagem via WebSocket:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Erro ao processar sua solicitação.',
            }));
        }
    });

    ws.on('close', () => {
        console.log(`Conexão WebSocket fechada para o usuário: ${userID}`);
        delete users[userID];
    });
};

// Buscar histórico de mensagens
exports.getMessageHistory = async (req, res) => {
    const { userId } = req.params;
    const loggedUserId = req.user.id;

    try {
        if (loggedUserId !== parseInt(userId, 10)) {
            return res.status(403).json({ success: false, message: 'Acesso negado.' });
        }

        const messages = await messageModel.getMessageHistory(loggedUserId, userId);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar o histórico de mensagens.' });
    }
};
