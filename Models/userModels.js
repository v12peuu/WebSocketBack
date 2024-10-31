const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true, 
        required: true,
        match: [/^[a-zA-Z0-9]+$/, 'O nome de usuário deve conter apenas letras e números']
    },
    password: { type: String, required: true }
}, { timestamps: true });

// Middleware para hashear a senha antes de salvar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar a senha
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
