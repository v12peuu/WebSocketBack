// models/User.js

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isAlphanumeric: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    return User;
  };
  