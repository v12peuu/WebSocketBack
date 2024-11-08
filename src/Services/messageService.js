// services/messageService.js

// Função para enviar uma mensagem
const sendMessage = async (senderId, recipientId, content) => {
    if (!senderId || !recipientId || !content) throw new Error('Dados de entrada inválidos.');

    const result = await pool.query(
        'INSERT INTO messages (sender, recipient, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, sender, recipient, content, created_at',
        [senderId, recipientId, content]
    );
    return result.rows[0];
};

// Função para obter todas as mensagens enviadas para um usuário específico
const getMessages = async (username) => {
    const result = await pool.query(
        'SELECT id, sender, content, created_at FROM messages WHERE recipient = $1 ORDER BY created_at DESC',
        [username]
    );
    return result.rows;
};

// Função para obter o histórico de mensagens entre dois usuários
const getMessageHistory = async (userId1, userId2) => {
    const result = await pool.query(
        `SELECT * FROM messages 
         WHERE (sender = $1 AND recipient = $2) OR (sender = $2 AND recipient = $1) 
         ORDER BY created_at ASC`,
        [userId1, userId2]
    );
    return result.rows;
};

module.exports = {
    sendMessage,
    getMessages,
    getMessageHistory,
};
