// server.js

require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const app = require('./app');
const jwt = require('jsonwebtoken');
const usersController = require('./Controllers/userscontroller');

const PORT = process.env.PORT || 8081;
const JWT_SECRET = process.env.JWT_SECRET;

const server = http.createServer(app);

// Configuração do WebSocket
const wsServer = new WebSocket.Server({ server });

wsServer.on('connection', (socket, req) => {
    const token = req.headers['sec-websocket-protocol'];
    if (!token) {
        socket.close(1008, 'Token não fornecido');
        return;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        usersController.registerWebSocket(socket, user.id);

        socket.on('message', (message) => {
            console.log(`Mensagem do cliente: ${message}`);
            socket.send('Mensagem recebida');
        });

        socket.on('close', () => {
            console.log('Conexão WebSocket fechada');
        });
    } catch (error) {
        socket.close(1008, 'Token inválido');
    }
});

server.listen(PORT, () => {
    console.log(`Servidor HTTP e WebSocket rodando na porta ${PORT}`);
});
