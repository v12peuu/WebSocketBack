const pool = require('../DataBase/db');
 // Importa o pool do arquivo db.js

// Função de envio de mensagem
const sendMessage = async (sender, recipient, content) => {
    try {
        if (!sender || !recipient || !content) throw new Error('Dados de entrada inválidos.');

        const result = await pool.query(
            'INSERT INTO messages (sender, recipient, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, sender, recipient, content, created_at',
            [sender, recipient, content]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw new Error('Erro ao enviar mensagem.');
    }
};

// Função para obter mensagens de um usuário
const getMessages = async (username) => {
    try {
        if (!username) throw new Error('Nome de usuário inválido.');

        const result = await pool.query(
            'SELECT id, sender, content, created_at FROM messages WHERE recipient = $1 ORDER BY created_at DESC',
            [username]
        );
        return result.rows;
    } catch (error) {
        console.error('Erro ao recuperar mensagens:', error);
        throw new Error('Erro ao recuperar mensagens.');
    }
};

// Função para obter o histórico de mensagens entre dois usuários
const getMessageHistory = async (userId1, userId2) => {
    try {
        if (!userId1 || !userId2) throw new Error('IDs de usuários inválidos.');

        const result = await pool.query(
            `SELECT id, sender, recipient, content, created_at
             FROM messages 
             WHERE (sender = $1 AND recipient = $2) OR (sender = $2 AND recipient = $1) 
             ORDER BY created_at ASC`,
            [userId1, userId2]
        );
        return result.rows;
    } catch (error) {
        console.error('Erro ao recuperar histórico de mensagens:', error);
        throw new Error('Erro ao recuperar histórico de mensagens.');
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getMessageHistory,
};
