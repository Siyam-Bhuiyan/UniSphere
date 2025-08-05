import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import express from "express";
import fs from "fs";
import multer from "multer";
import { OpenAI } from "openai";
import path from "path";
import pdfParse from 'pdf-parse';
import { createWorker } from "tesseract.js";
import { ChromaClient } from 'chromadb';

// Force local storage regardless of environment variables
const useLocalStorage = true;
console.log("Using local storage for file uploads (Cloudinary disabled)");

// Initialize ChromaDB client
const chromaClient = new ChromaClient();
let documentCollection;

// Initialize the ChromaDB collection
async function initChromaDB() {
  try {
    // Create or get the collection for document embeddings
    const collections = await chromaClient.listCollections();
    const collectionExists = collections.some(c => c.name === 'document_embeddings');
    
    if (collectionExists) {
      documentCollection = await chromaClient.getCollection({
        name: 'document_embeddings'
      });
      console.log("ChromaDB: Connected to existing collection");
    } else {
      documentCollection = await chromaClient.createCollection({
        name: 'document_embeddings',
        metadata: { description: 'Document embeddings for RAG system' }
      });
      console.log("ChromaDB: Created new collection");
    }
  } catch (error) {
    console.error("Error initializing ChromaDB:", error);
    console.warn("Vector database functionality will be limited");
  }
}

// Initialize ChromaDB on startup
initChromaDB().catch(console.error);

// Initialize Gemini AI
const GEMINI_AI_KEY = process.env.GEMINI_AI_KEY;
let model = null;
if (GEMINI_AI_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_AI_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
  console.log("Gemini AI initialized");
} else {
  console.warn("Gemini AI key not found. Quiz generation will use fallback.");
}

const router = express.Router();

// Configure local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"), false);
    }
  },
}).single("file");

// Helper function to get authenticated Cloudinary URL
function getAuthenticatedCloudinaryUrl(publicId) {
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return null;
  }
  
  // Generate authenticated URL for private resources
  return cloudinary.url(publicId, {
    sign_url: true,
    auth_token: {
      key: process.env.CLOUDINARY_API_KEY,
      duration: 3600, // 1 hour
    },
    resource_type: "auto",
  });
}

// Helper function to download file with proper authentication
async function downloadFileWithAuth(fileUrl, headers = {}) {
  try {
    console.log("Attempting to process file:", fileUrl);

    // Check if this is a local URL from our server (starts with our host)
    if (fileUrl.includes('/uploads/')) {
      // Extract the filename from the URL
      const parts = fileUrl.split('/uploads/');
      if (parts.length < 2) {
        throw new Error("Invalid local file URL format");
      }
      
      const fileName = parts[1].split('?')[0]; // Remove any query parameters
      const filePath = path.join(process.cwd(), "uploads", fileName);
      
      console.log("Accessing local file at:", filePath);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error("Local file not found:", filePath);
        const err = new Error("File not found");
        err.response = { status: 404 };
        throw err;
      }
      
      // Read the file and return it in the same format as axios would
      const data = fs.readFileSync(filePath);
      console.log("Local file read successfully, size:", data.length);
      
      return { data };
    } else {
      // Handle external URLs
      console.log("Downloading external file:", fileUrl);
      const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        ...headers
      };
      
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: defaultHeaders,
        maxRedirects: 5,
      });
      
      console.log("External file downloaded successfully, size:", response.data.byteLength);
      return response;
    }
  } catch (error) {
    console.error("Download/access error:", error.message);
    throw error;
  }
}

// Handle file upload
router.post("/upload", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("Multer error during upload:", err);
      return res.status(400).json({
        success: false,
        msg: err.message,
      });
    }

    if (!req.file) {
      console.error("No file received by /upload endpoint.");
      return res.status(400).json({
        success: false,
        msg: "No file uploaded",
      });
    }

    try {
      // Always use local storage
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log("Created uploads directory at:", uploadsDir);
      }
      
      const fileName = req.file.filename;
      const filePath = path.join(uploadsDir, fileName);
      
      // Verify file exists
      if (!fs.existsSync(filePath)) {
        console.error("Warning: File was not correctly saved by multer:", filePath);
        return res.status(500).json({
          success: false,
          msg: "Error saving uploaded file",
        });
      }
      
      console.log("File successfully saved to:", filePath);
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
      console.log("File accessible at URL:", fileUrl);
      
      return res.json({
        success: true,
        file: {
          url: fileUrl,
          publicId: fileName,
        },
      });
    } catch (error) {
      console.error("Error in file upload processing:", error);
      return res.status(500).json({
        success: false,
        msg: "Server error during file upload processing",
        error: error.message,
      });
    }
  });
});

// @route   GET api/virtual-quiz/test
// @desc    Test route
// @access  Public
router.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ msg: "Virtual Quiz API is working" });
});

// @route   POST api/virtual-quiz/extract-text
// @desc    Extract text from a PDF or image
// @access  Private
router.post("/extract-text", async (req, res) => {
  try {
    const { fileUrl, fileType } = req.body;
    console.log("Received request:", { fileUrl, fileType });

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        msg: "File URL is required",
      });
    }

    let extractedText = "";

    // Extract text from PDF
    if (fileType === "pdf") {
      try {
        console.log("Downloading PDF file...");
        
        // Use the download function with authentication
        const response = await downloadFileWithAuth(fileUrl);
        console.log("PDF downloaded successfully");

        const buffer = Buffer.from(response.data);
        console.log("Buffer created, size:", buffer.length);

        // Use pdf-parse to extract text
        console.log("Parsing PDF document...");
        const data = await pdfParse(buffer);
        
        extractedText = data.text.trim();
        console.log("Text extraction completed, length:", extractedText.length);
        
      } catch (pdfError) {
        console.error("PDF extraction error:", pdfError);
        
        // Enhanced error handling
        if (pdfError.response) {
          const status = pdfError.response.status;
          if (status === 401) {
            return res.status(401).json({
              success: false,
              msg: "Unauthorized access to PDF file. The file may be private or require authentication. Please ensure the file is publicly accessible or upload it directly.",
              error: pdfError.message,
              suggestion: "Try uploading the file directly instead of using a URL, or make sure the file is publicly accessible."
            });
          } else if (status === 403) {
            return res.status(403).json({
              success: false,
              msg: "Access forbidden to PDF file. Please check file permissions.",
              error: pdfError.message,
            });
          } else if (status === 404) {
            return res.status(404).json({
              success: false,
              msg: "PDF file not found at the provided URL.",
              error: pdfError.message,
            });
          }
        }
        
        return res.status(500).json({
          success: false,
          msg: "Failed to extract text from PDF. This could be due to file access restrictions, corruption, or an unsupported PDF format.",
          error: pdfError.message,
          suggestion: "Try uploading the file directly or ensure it's a standard, non-encrypted PDF."
        });
      }
    }
    // Extract text from image using OCR
    else if (fileType === "image") {
      try {
        console.log("Initializing Tesseract worker...");
        const worker = await createWorker();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        console.log("Tesseract worker initialized");

        // Download the image using the new function
        console.log("Downloading image...");
        const response = await downloadFileWithAuth(fileUrl);
        console.log("Image downloaded successfully");

        const buffer = Buffer.from(response.data);
        console.log("Image buffer created, size:", buffer.length);

        // Recognize text from image buffer
        console.log("Starting OCR processing...");
        const { data } = await worker.recognize(buffer);
        extractedText = data.text;
        console.log("OCR completed, text length:", extractedText.length);

        await worker.terminate();
        console.log("Tesseract worker terminated");
        
      } catch (ocrError) {
        console.error("OCR error:", ocrError);
        
        if (ocrError.response?.status === 401) {
          return res.status(401).json({
            success: false,
            msg: "Unauthorized access to image file. Please ensure the file is publicly accessible or upload it directly.",
            error: ocrError.message,
          });
        }
        
        return res.status(500).json({
          success: false,
          msg: "Failed to extract text from image. This could be due to file access restrictions or poor image quality.",
          error: ocrError.message,
          suggestion: "Try uploading the file directly or ensure the image has clear, readable text."
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        msg: "Unsupported file type. Only PDF and image files are supported.",
      });
    }

    // If no text was extracted or text is too short
    if (!extractedText || extractedText.trim().length < 5) {
      console.log("Warning: Minimal or no text extracted");
      return res.status(200).json({
        success: true,
        text: "No readable text found in the document. The file might be scanned, encrypted, or contain only images.",
        warning: "minimal_text",
      });
    }
    
    // Store the extracted text in ChromaDB for future retrieval
    let documentId;
    try {
      if (documentCollection) {
        // Generate a unique ID for this document
        documentId = `doc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        
        // Split text into chunks (~1000 characters each)
        const chunks = chunkText(extractedText, 1000);
        
        // Store chunks in ChromaDB
        const chunkIds = chunks.map((_, idx) => `${documentId}_chunk_${idx}`);
        const chunkMetadata = chunks.map((chunk, idx) => ({
          documentId,
          chunkIndex: idx,
          totalChunks: chunks.length,
          extractedFrom: fileUrl
        }));
        
        await documentCollection.add({
          ids: chunkIds,
          documents: chunks,
          metadatas: chunkMetadata,
        });
        
        console.log(`Stored ${chunks.length} chunks in ChromaDB with document ID: ${documentId}`);
      } else {
        console.warn("ChromaDB not initialized, skipping vector storage");
      }
    } catch (chromaError) {
      console.error("Error storing text in ChromaDB:", chromaError);
      // Continue anyway, we'll return the text directly as fallback
    }

    console.log("Successfully extracted text, sending response");
    res.json({
      success: true,
      text: extractedText.substring(0, 1000) + "...", // Send only a preview
      documentId: documentId || null, // Return the document ID for later retrieval
      fullTextLength: extractedText.length,
      storedInVectorDB: !!documentId
    });
    
  } catch (err) {
    console.error("Error extracting text:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during text extraction",
      error: err.message,
      suggestion: "Please try again or contact support if the issue persists."
    });
  }
});

// Helper function to chunk text for vector storage
function chunkText(text, chunkSize = 1000, overlap = 200) {
  if (!text) return [];
  
  const chunks = [];
  let position = 0;
  
  while (position < text.length) {
    // Calculate end position with potential sentence boundary
    let end = Math.min(position + chunkSize, text.length);
    
    // Try to find a sentence boundary
    if (end < text.length) {
      const nextPeriod = text.indexOf('.', end - 50);
      if (nextPeriod > 0 && nextPeriod < end + 50) {
        end = nextPeriod + 1;  // Include the period
      }
    }
    
    // Add the chunk
    chunks.push(text.substring(position, end));
    
    // Move position with overlap
    position = end - overlap;
    if (position < 0) position = 0;
    
    // Break if we've processed the entire text
    if (position >= text.length) break;
  }
  
  return chunks;
}

// --- OpenAI Setup for RAG ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
  console.log("OpenAI API initialized");
} else {
  console.warn("OpenAI API key not found. RAG will not be available.");
}

// Helper: Truncate context if too large for model (GPT-4o mini supports ~400k chars)
function truncateContext(context, maxLength = 350000) {
  if (!context) return "";
  if (context.length <= maxLength) return context;
  console.warn("Context too large, truncating for OpenAI context window.");
  return context.slice(0, maxLength);
}

// @route   POST api/virtual-quiz/chat
// @desc    Chat with AI using extracted text as context (RAG with OpenAI)
// @access  Private
router.post("/chat", async (req, res) => {
  try {
    const { message, documentId } = req.body;
    console.log("Received chat request:", { message, documentId });

    if (!message) {
      return res.status(400).json({
        success: false,
        msg: "Message is required",
      });
    }

    let context = "";
    
    // Retrieve relevant chunks from ChromaDB if documentId is provided
    if (documentId && documentCollection) {
      try {
        // Query ChromaDB for relevant chunks using the question
        const results = await documentCollection.query({
          queryTexts: [message],
          where: { documentId },
          nResults: 5  // Get top 5 most relevant chunks
        });
        
        if (results && results.documents && results.documents.length > 0) {
          // Combine the chunks into the context
          context = results.documents[0].join("\n\n");
          console.log(`Retrieved ${results.documents[0].length} relevant chunks from ChromaDB`);
        } else {
          console.warn("No relevant chunks found in ChromaDB");
        }
      } catch (chromaError) {
        console.error("Error querying ChromaDB:", chromaError);
        // Continue anyway, we'll use fallback search
      }
    } else if (req.body.context) {
      // Fallback: Use context from request if provided (for backward compatibility)
      context = req.body.context;
      console.log("Using context from request body");
    }

    // --- RAG with OpenAI Large Context ---
    if (openai && context) {
      try {
        const contextToSend = truncateContext(context);
        console.log("RAG: Using context length:", contextToSend.length);

        const systemPrompt = "You are a helpful assistant that answers questions based on the provided documentation/context. If the answer isn't in the context, say so politely.";
        const userPrompt = `
Documentation:
${contextToSend}

Question: ${message}

Please answer the question using information from the documentation. If the answer isn't in the documentation, say so politely.
        `;

        const completionResp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 16000
        });

        const botResponse = completionResp.choices[0].message.content;
        console.log("RAG: OpenAI response:", botResponse);

        return res.json({
          success: true,
          message: botResponse,
          rag: true,
        });
      } catch (ragError) {
        console.error("RAG error:", ragError);
        // fallback below
      }
    }

    // --- Fallback: Keyword search in context ---
    console.warn("OpenAI RAG not available, using fallback keyword search.");
    const keywords = message.toLowerCase().split(/\s+/);
    const sentences = context
      ?.split(/[.!?]+/)
      .filter((s) => s.trim().length > 0) || [];

    // Find sentences containing keywords from the user's message
    const relevantSentences = sentences.filter((sentence) =>
      keywords.some(
        (keyword) =>
          keyword.length > 3 && sentence.toLowerCase().includes(keyword)
      )
    );

    let fallbackResponse;
    if (relevantSentences.length > 0) {
      fallbackResponse =
        "Here's what I found in your document:\n\n" +
        relevantSentences.slice(0, 3).join(". ") +
        ".";
    } else {
      fallbackResponse =
        "I couldn't find specific information about that in your document. Could you try asking a different question?";
    }

    return res.json({
      success: true,
      message: fallbackResponse,
      fallback: true,
    });
  } catch (err) {
    console.error("Error in chat:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during chat",
      error: err.message,
    });
  }
});

// @route   POST api/virtual-quiz/delete-file
// @desc    Delete a file from Cloudinary or local storage
// @access  Private
router.post("/delete-file", async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        msg: "Public ID is required",
      });
    }

    // Always use local storage
    const filePath = path.join(process.cwd(), "uploads", publicId);
    console.log("Attempting to delete file:", filePath);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File successfully deleted");
      return res.json({ success: true });
    } else {
      console.warn("File not found for deletion:", filePath);
      // Still return success as the file doesn't exist anyway
      return res.json({ 
        success: true,
        warning: "File not found, but operation considered successful"
      });
    }
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during file deletion",
      error: err.message,
    });
  }
});

// @route   POST api/virtual-quiz/generate-quiz
// @desc    Generate quiz questions based on a topic
// @access  Public
router.post("/generate-quiz", async (req, res) => {
  try {
    const { topic, difficulty = "medium", questionCount = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        msg: "Topic is required",
      });
    }

    // Check if Gemini API is available
    if (!GEMINI_AI_KEY || !model) {
      console.warn(
        "Gemini API key not found or initialization failed. Using fallback response."
      );
      
      // Generate fallback questions
      const fallbackQuestions = generateFallbackQuestions(
        topic,
        parseInt(questionCount),
        difficulty
      );

      return res.json({
        success: true,
        questions: fallbackQuestions,
        fallback: true,
        msg: "Using fallback question generation. For better results, configure Gemini AI."
      });
    }

    // Use Gemini AI to generate quiz questions
    try {
      const prompt = `You are a quiz generator. Create ${questionCount} ${difficulty} difficulty level questions about "${topic}".
      
      Format your response as a valid JSON array of objects with the following structure:
      [
        {
          "question": "The question text goes here?",
          "answer": "The correct answer goes here"
        }
      ]
      
      Make sure the questions are factually accurate and appropriate for ${difficulty} difficulty level.
      For easy questions, focus on basic facts and definitions.
      For medium questions, include more detailed knowledge and some application of concepts.
      For hard questions, include complex concepts, specific details, and challenging applications.
      
      ONLY return the JSON array with no additional text or explanation.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from the response
      let questions;
      try {
        // Find JSON array in the response
        const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found in response");
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from AI response:", jsonError);
        console.log("Raw response:", responseText);

        // Attempt to fix common JSON formatting issues
        try {
          // Replace single quotes with double quotes and clean up
          const fixedJson = responseText
            .replace(/'/g, '"')
            .replace(/\n/g, " ")
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
            .trim();

          // Try to extract JSON array
          const match = fixedJson.match(/\[\s*\{.*\}\s*\]/s);
          if (match) {
            questions = JSON.parse(match[0]);
          } else {
            throw new Error("Could not extract JSON array after fixing");
          }
        } catch (fixError) {
          console.error("Error after attempting to fix JSON:", fixError);

          // Generate fallback questions if JSON parsing fails
          questions = generateFallbackQuestions(
            topic,
            parseInt(questionCount),
            difficulty
          );
        }
      }

      // Validate questions format
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid questions format");
      }

      // Ensure each question has the required fields
      questions = questions.map((q, index) => ({
        question: q.question || `What is an important fact about ${topic}? (Question ${index + 1})`,
        answer: q.answer || "Information not available",
      }));

      // Limit to requested question count
      questions = questions.slice(0, parseInt(questionCount));

      res.json({
        success: true,
        questions,
      });
    } catch (aiError) {
      console.error("Gemini API error:", aiError);

      // Generate fallback questions
      const fallbackQuestions = generateFallbackQuestions(
        topic,
        parseInt(questionCount),
        difficulty
      );

      res.json({
        success: true,
        questions: fallbackQuestions,
        fallback: true,
        msg: "AI service temporarily unavailable. Using fallback questions."
      });
    }
  } catch (err) {
    console.error("Error generating quiz:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during quiz generation",
      error: err.message,
    });
  }
});

// Helper function to generate fallback questions when AI fails
function generateFallbackQuestions(topic, count = 5, difficulty = "medium") {
  const questions = [];

  // Basic question templates based on difficulty
  const easyTemplates = [
    {
      q: `What is ${topic}?`,
      a: `${topic} is a concept or subject in its relevant field.`,
    },
    {
      q: `Name one important aspect of ${topic}.`,
      a: `One important aspect of ${topic} is its significance in its field.`,
    },
    {
      q: `Is ${topic} important? Why?`,
      a: `Yes, ${topic} is important because it plays a significant role in its domain.`,
    },
  ];

  const mediumTemplates = [
    {
      q: `How does ${topic} work?`,
      a: `${topic} functions through specific processes relevant to its domain.`,
    },
    {
      q: `What are the main components of ${topic}?`,
      a: `${topic} consists of several key components or elements.`,
    },
    {
      q: `Who is associated with ${topic}?`,
      a: `Various experts and scholars have contributed to ${topic}.`,
    },
    {
      q: `When did ${topic} become significant?`,
      a: `${topic} gained significance at an important point in history.`,
    },
  ];

  const hardTemplates = [
    {
      q: `What is a common misconception about ${topic}?`,
      a: `There are several misconceptions about ${topic} that experts have clarified.`,
    },
    {
      q: `How has ${topic} evolved over time?`,
      a: `${topic} has evolved significantly throughout its history.`,
    },
    {
      q: `What is the future of ${topic}?`,
      a: `Experts predict various developments in the future of ${topic}.`,
    },
    {
      q: `What are the challenges associated with ${topic}?`,
      a: `${topic} faces several challenges that researchers are working to address.`,
    },
  ];

  // Select templates based on difficulty
  let templates;
  switch (difficulty.toLowerCase()) {
    case 'easy':
      templates = easyTemplates;
      break;
    case 'hard':
      templates = hardTemplates;
      break;
    default:
      templates = mediumTemplates;
  }

  // Generate the requested number of questions
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    questions.push({
      question: template.q,
      answer: template.a,
    });
  }

  return questions;
}

export default router;