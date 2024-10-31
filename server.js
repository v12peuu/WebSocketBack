require('dotenv').config();
const app = require('./app');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const usersController = require('./Controllers/userscontroller');

const PORT = process.env.PORT || 8081;
const JWT_SECRET = process.env.JWT_SECRET;

const server = http.createServer(app);

// Inicializa o WebSocket com o mesmo servidor HTTP
const wsServer = new WebSocket.Server({ server });

wsServer.on('connection', (socket, req) => {
    console.log('Cliente conectado ao WebSocket');

    // Autentica o cliente usando o JWT enviado no cabeçalho
    const token = req.headers['sec-websocket-protocol'];
    if (!token) {
        socket.close(1008, 'Token não fornecido');
        return;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        
        // Registra o WebSocket no controller de usuários
        usersController.registerWebSocket(socket, user.id);

        // Defina ouvintes de eventos do WebSocket
        socket.on('open', () => {
            console.log('Conectado ao servidor WebSocket');
        });

        socket.on('message', (message) => {
            console.log(`Mensagem do cliente: ${message}`);
            socket.send('Mensagem recebida');
        });

        socket.on('close', () => {
            console.log('Conexão WebSocket fechada');
        });

        socket.on('error', (error) => {
            console.error("Erro WebSocket:", error);
        });

    } catch (error) {
        console.error('Token inválido:', error);
        socket.close(1008, 'Token inválido');
    }
});

server.listen(PORT, () => {
    console.log(`Servidor HTTP e WebSocket rodando na porta ${PORT}`);
});
