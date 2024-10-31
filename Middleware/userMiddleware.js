const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Erro de autenticação:', err);

            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ success: false, message: 'Token expirado. Faça login novamente.' });
            }

            return res.status(401).json({ success: false, message: 'Token inválido. Não autorizado.' });
        }

        req.user = decoded; // Armazena as informações decodificadas do usuário
        next();
    });
};
