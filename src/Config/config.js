// config/config.js

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'your_database',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  },
  // Caso precise de configurações específicas para produção, pode adicionar mais objetos
};
