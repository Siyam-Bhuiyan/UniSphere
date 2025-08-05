import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { mkdir } from "fs/promises";
import { createServer } from "http";
import path from "path";
import connectDB from "./config/db.js";
import faqData from "./data/faq_training_data.js";
import adminRoutes from "./routes/adminRoutes.js";
import alertRoutes from "./routes/alerts.js";
import virtualQuizRoutes from "./routes/api/virtualQuiz.js";
import authRoutes from "./routes/authRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import clubRoutes from './routes/clubRoutes.js';
import departmentRoutes from "./routes/departmentRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import faculty from "./routes/facultyRoutes.js";
import lostFoundRoutes from "./routes/lostFoundRoutes.js";
import mealRoutes from "./routes/mealRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import navigationRoutes from "./routes/navigationRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import studentRoutes from "./routes/studentDataRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import initializeSocketServer from "./socket-server.js";

dotenv.config();
connectDB();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5175", "http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Add explicit headers for all responses to ensure CORS works properly
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
const __dirname = new URL(".", import.meta.url).pathname;
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create uploads directory if it doesn't exist
try {
  await mkdir("uploads", { recursive: true });
  console.log("Uploads directory created or already exists");
} catch (err) {
  console.error("Error creating uploads directory:", err);
}

const GEMINI_AI_KEY = process.env.GEMINI_AI;
const genAI = new GoogleGenerativeAI(GEMINI_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const findRelevantFAQs = (message) => {
  const relevantFAQs = [];
  Object.values(faqData.faqTrainingData).forEach((category) => {
    Object.values(category).forEach((subcategory) => {
      subcategory.forEach((qa) => {
        if (
          qa.question.toLowerCase().includes(message.toLowerCase()) ||
          qa.answer.toLowerCase().includes(message.toLowerCase())
        ) {
          relevantFAQs.push(qa);
        }
      });
    });
  });
  return relevantFAQs.slice(0, 2);
};

app.post("/api/chat", cors(), async (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const relevantFAQs = findRelevantFAQs(message);
    const faqContext = relevantFAQs
      .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
      .join("\n\n");

    const prompt = `You are UniSphere's helpful assistant.\n\nHere are some relevant FAQ entries that might help:\n${faqContext}\n\nBased on this context, please provide a helpful response to: ${message}`;

    const result = await model.generateContent(prompt);
    const botResponse = result.response.text();

    return res.json({ text: botResponse });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({ error: "Failed to process your message" });
  }
});

// Routes
app.use("/api/meals", mealRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/class", classRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/faculty", faculty);
app.use("/api/navigation", navigationRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/lostfound", lostFoundRoutes);
app.use("/api/virtual-quiz", virtualQuizRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/clubs", clubRoutes);

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = initializeSocketServer(httpServer);
app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.io server initialized for real-time bus tracking");
});