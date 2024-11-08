// utils/validators.js

// Validação de username: letras e números, sem espaços
const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return typeof username === 'string' && username.length >= 3 && username.length <= 20 && usernameRegex.test(username);
};

// Validação de senha: pelo menos 8 caracteres, com letras, números e opcionalmente caracteres especiais
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return typeof password === 'string' && passwordRegex.test(password);
};

// Validação de mensagem: verifica se o conteúdo não está vazio e tem limite de tamanho
const validateMessage = (message) => {
    return typeof message === 'string' && message.trim().length > 0 && message.length <= 500;
};

module.exports = {
    validateUsername,
    validatePassword,
    validateMessage
};
