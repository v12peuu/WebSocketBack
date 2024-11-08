// services/userService.js
const bcrypt = require('bcrypt');

const findUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

// Função para buscar usuário pelo nome de usuário
const findUserByUsername = async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
};

// Função para criar um novo usuário
const createUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
        [username, hashedPassword]
    );
    return result.rows[0];
};

// Função para verificar a senha do usuário
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    findUserById,
    findUserByUsername,
    createUser,
    verifyPassword,
};
