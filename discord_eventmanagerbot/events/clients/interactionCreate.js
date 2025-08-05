module.exports = {
    name: "interactionCreate", // Fix: was "interactionCreates"
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            
            console.log(`Command attempted: ${commandName}`); // Debug log
            
            if (!command) {
                console.log(`Command not found: ${commandName}`); // Debug log
                return;
            }
            
            try {
                console.log(`Executing command: ${commandName}`); // Debug log
                await command.execute(interaction, client);
                console.log(`Command completed: ${commandName}`); // Debug log
            } catch (error) {
                console.error(`Error executing command ${commandName}:`, error);
                await interaction.reply({
                    content: `Something went wrong while executing this command...`,
                    ephemeral: true
                });
            }
        }
    }
};