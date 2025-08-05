const Groq =require("groq-sdk");
const Announcement = require('../models/Announcement');
require('dotenv').config();

class GroqService {
    constructor() {
        // Initialize Groq client with API key
        this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
        // Default model
        this.model = process.env.GROQ_MODEL || 'llama3-8b-8192';
    }

    /**
     * Query Groq about announcements
     * @param {string} query - The user's query about announcements
     * @returns {Promise<string>} - Groq's response
     */
    async query_announcement(query) {
        try {
            // Fetch recent announcements from database
            const recentAnnouncements = await Announcement.find()
                .sort({ createdAt: -1 })
                .limit(10);

            if (recentAnnouncements.length === 0) {
                return "There are no recent announcements available.";
            }

            // Format announcements for context
            const announcementsContext = recentAnnouncements.map(ann => {
                const date = new Date(ann.createdAt).toLocaleString();
                return `[${date}] ${ann.authorUsername}: ${ann.content}`;
            }).join('\n\n');

            // Create prompt for Groq
            const systemPrompt = `You are an assistant that provides information only about announcements. 
            Only answer questions related to the announcements provided. 
            For any questions not related to these announcements, politely explain that you can only provide information about announcements.Remember the timezone is of Bangladesh UTC +6.00 .make sure to calculate the date when someone is saying next friday ,tomorrow,today,etc. and answer according to the date and time
            Here are the recent announcements:

            ${announcementsContext}`;

            // Call Groq API
            const completion = await this.client.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                model: this.model,
                temperature: 0.5,
                max_tokens: 1000,
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('Error querying Groq:', error);
            return 'Sorry, I encountered an error while processing your request.';
        }
    }
}

module.exports = new GroqService();