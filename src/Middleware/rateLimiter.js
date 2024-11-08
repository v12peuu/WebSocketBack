const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Muitas requisições. Por favor, tente novamente mais tarde.' }
});

module.exports = apiLimiter;
