module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        console.log('Bot is ready!');
        console.log(`Loaded ${client.commands.size} commands`);
        console.log('Command names:', Array.from(client.commands.keys()));
    }
};