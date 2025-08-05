const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Returns bot latency'),
    async execute(interaction, client) {
        // Send initial reply and get the response
        const sent = await interaction.reply({ 
            content: 'Calculating ping...', 
            fetchReply: true // Will be removed in future versions
        });

        // Calculate latencies
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = client.ws.ping;

        // Edit the reply with the latency information
        await interaction.editReply({
            content: `🏓 Pong!\n📶 Latency: ${latency}ms\n🌐 API Latency: ${apiLatency}ms`
        });

        // Debug logs
        console.log(`Command executed: ping`);
        console.log(`Latency: ${latency}ms`);
        console.log(`API Latency: ${apiLatency}ms`);
    }
};