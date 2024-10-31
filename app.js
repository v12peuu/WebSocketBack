require('dotenv').config();
const express = require('express');
const usersController = require('./Controllers/userscontroller');
const { authenticate } = require('./Middleware/userMiddleware');
const morgan = require('morgan');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 8082;

app.use(morgan('combined'));
app.use(express.json());

app.post('/api/auth/register', usersController.register);
app.post('/api/auth/login', usersController.login);
app.get('/api/users/me', authenticate, usersController.getUser);
app.get('/api/users', authenticate, usersController.findAll);
app.post('/api/messages/send', authenticate, usersController.sendMessage);
app.get('/api/messages/history', authenticate, usersController.getConversationHistory);



const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
