const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandsPath = path.join(process.cwd(), 'commands');
        const commandFolders = fs.readdirSync(commandsPath);

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    client.commandArray.push(command.data.toJSON());
                    console.log(`Loaded command: ${command.data.name}`);
                }
            }
        }

        // Log what the user is asking for (commands loaded)
        console.log('Commands loaded:', client.commands.map(cmd => cmd.data.name));

        const clientId = process.env.CLIENT_ID;
        const guildId = process.env.GUILD_ID;

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: client.commandArray }
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    };
};