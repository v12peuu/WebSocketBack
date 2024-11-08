// models/Message.js

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
  
    // Configuração das associações, se necessário
    Message.associate = (models) => {
      Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
      Message.belongsTo(models.User, { as: 'recipient', foreignKey: 'recipientId' });
    };
  
    return Message;
  };
  