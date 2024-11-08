// models/userModel.js

const users = []; // Array em memória para armazenar os usuários

// Classe User para criar instâncias de usuários
class User {
    constructor(username, password) {
        this.id = users.length + 1; // ID único baseado na posição no array
        this.username = username;
        this.password = password;
        this.createdAt = new Date();
    }
}

// Função para criar um novo usuário
const createUser = (username, password) => {
    const user = new User(username, password);
    users.push(user);
    return user;
};

// Função para buscar um usuário pelo ID
const findUserById = (id) => {
    return users.find(user => user.id === id) || null;
};

// Função para retornar todos os usuários
const getAllUsers = () => {
    return users.map(user => ({ id: user.id, username: user.username, createdAt: user.createdAt }));
};

module.exports = {
    createUser,
    findUserById,
    getAllUsers,
};
