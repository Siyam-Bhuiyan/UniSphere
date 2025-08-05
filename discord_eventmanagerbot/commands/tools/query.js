const { SlashCommandBuilder } = require('discord.js');
const groqService = require('../../services/groqService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Query about announcements')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Your question about the announcements')
                .setRequired(true)),
    
    async execute(interaction, client) {
        try {
            // Get the user's query
            const question = interaction.options.getString('query');
            console.log(`User asked: "${question}"`);
            
            // Defer the reply first - this tells Discord we're working on it
            await interaction.deferReply();
            
            // Call the Groq service to process the query - this might take time
            console.log("Calling Groq service...");
            const response = await groqService.query_announcement(question);
            console.log("Got response from Groq service");
            
            // Edit the deferred reply with the response
            await interaction.editReply({
                content: response
            });
        } catch (error) {
            console.error('Error in ask command:', error);
            
            // Check if we can still reply to the interaction
            if (interaction.deferred) {
                await interaction.editReply({
                    content: 'Sorry, I encountered an error while processing your query.'
                }).catch(err => {
                    console.error('Failed to edit reply:', err);
                });
            } else {
                await interaction.reply({
                    content: 'Sorry, I encountered an error while processing your query.',
                    ephemeral: true
                }).catch(err => {
                    console.error('Failed to reply:', err);
                });
            }
        }
    }
};
