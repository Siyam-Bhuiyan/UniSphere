require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/database');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.commandArray = [];

// Debug log for initialization
console.log('Starting bot initialization...');

const functionsPath = path.join(__dirname, 'functions');
const functionFolders = fs.readdirSync(functionsPath);

for (const folder of functionFolders) {
    const folderPath = path.join(functionsPath, folder);
    const functionFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of functionFiles) {
        const filePath = path.join(folderPath, file);
        console.log(`Loading function file: ${file}`);
        require(filePath)(client);
    }
}

console.log('Handling events...');
client.handleEvents();

console.log('Handling commands...');
client.handleCommands();

// Connect to MongoDB
connectDB()
    .then(() => {
        // After MongoDB is connected, login to Discord
        return client.login(process.env.TOKEN);
    })
    .then(() => console.log('Bot logged in successfully'))
    .catch(error => console.error('Initialization error:', error));