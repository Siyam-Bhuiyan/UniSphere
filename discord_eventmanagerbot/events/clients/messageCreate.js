const Announcement = require('../../models/Announcement');

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        // Check if the message is from the announcement channel
        if (message.channelId === '1345876599500968076') {
            try {
                // Create a new announcement document
                const announcement = new Announcement({
                    messageId: message.id,
                    content: message.content,
                    channelId: message.channelId,
                    authorId: message.author.id,
                    authorUsername: message.author.username
                });
                
                // Save to database
                await announcement.save();
                
                console.log(`Announcement saved to database: ${message.id}`);
            } catch (error) {
                console.error('Error saving announcement to database:', error);
            }
        }
    }
};
