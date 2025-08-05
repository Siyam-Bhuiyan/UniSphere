const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.handleEvents = async () => {
        const eventsPath = path.join(process.cwd(), 'events');
        const eventFolders = fs.readdirSync(eventsPath);

        for (const folder of eventFolders) {
            const folderPath = path.join(eventsPath, folder);
            const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

            for (const file of eventFiles) {
                const filePath = path.join(folderPath, file);
                const event = require(filePath);

                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
                console.log(`Loaded event: ${event.name}`);
            }
        }
    };

    client.on('messageCreate', (message) => {
        if (message.author.bot) return;

        console.log(`Received message: ${message.content}`);
    });

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });
};