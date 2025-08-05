import { Groq } from "groq-sdk";
import Roadmap from "../models/Roadmap.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const generateRoadmap = async (req, res) => {
  const { userId, course, goals, experience, timeCommitment, preferences, tools, feedback } = req.body;

  try {
    // Create the system message with instructions
    const systemMessage = `
      You are an AI assistant that generates personalized learning roadmaps for university students.
      Follow these guidelines:
      1. Include 5 sections: Introduction, Key Topics, Resources, Projects, and Motivation Tips
      2. Use clear section titles (e.g., "Introduction", "Key Topics", etc.) in bold or with clear separation, but do NOT use markdown headers (no ##, #, etc.)
      3. Use simple bullet points (dashes or asterisks) for lists, and keep formatting clean and web-friendly
      4. Recommend specific resources with URLs when possible
      5. Suggest realistic timelines based on weekly commitment
      6. Add a blank line between sections for readability
      7. Do not use any markdown formatting like **, __, //, or special symbols
      8. Make the roadmap visually appealing and easy to read for web display
    `;

    // Create the user message with the actual prompt
    const userPrompt = `
      Generate a roadmap for: ${course}
      Primary Goal: ${goals.primaryGoal}
      Experience Level: ${experience.description}
      Time Commitment: ${timeCommitment.hoursPerWeek} hours/week
      Learning Style: ${preferences.learningStyle}
      Tools/Projects: ${tools}
      Additional Notes: ${feedback}
    `;

    // Call Groq API with chat completion
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 1500,
      top_p: 1,
      stream: false
    });

    const generatedContent = response.choices[0]?.message?.content || "";

    // Save to database
    const roadmap = new Roadmap({
      userId,
      course,
      goals,
      experience,
      timeCommitment,
      preferences,
      tools,
      feedback,
      generatedRoadmap: generatedContent
    });

    await roadmap.save();

    res.status(201).json({ 
      success: true,
      roadmap: {
        ...roadmap.toObject(),
        generatedContent
      }
    });

  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate roadmap",
      error: error.message
    });
  }
};

export { generateRoadmap };
