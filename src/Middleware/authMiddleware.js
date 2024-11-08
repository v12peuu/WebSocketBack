const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Erro de autenticação:', err);
            return res.status(401).json({ success: false, message: 'Token inválido. Não autorizado.' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = { verifyJWT };
