// app.js

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

// Importação das rotas
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const messageRoutes = require('./Routes/messageRoutes');

const app = express();
app.use(morgan('combined'));
app.use(express.json());

// Configuração das rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

module.exports = app;
