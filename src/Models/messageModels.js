const messages = [];
 
class Message {
    constructor(senderId, recipientId, content) {
        this.id = messages.length + 1;  
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.content = content;
        this.createdAt = new Date();

    } 
};