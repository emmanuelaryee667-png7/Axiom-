import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable cross-origin resource sharing (CORS) so PWA analyzers (like PWABuilder) can fetch the manifest and icons
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Set up generous payload limits for base64 files and PDFs
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Initialize GenAI safely using lazy initialization inside route handlers or a shared getter
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Math Solver Endpoint
app.post("/api/solve", async (req, res) => {
  try {
    const { fileBase64, mimeType, textPrompt } = req.body;
    const ai = getAiClient();

    let parts: any[] = [];

    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: fileBase64,
        },
      });
    }

    const defaultPrompt = "Please solve this mathematical problem step-by-step. Provide a thorough mathematical explanation of the concepts, formulas used, intermediate logical steps, and final answer.";
    parts.push({
      text: textPrompt ? `${textPrompt}\n\nSolve this question step-by-step.` : defaultPrompt,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problem: {
              type: Type.STRING,
              description: "A clean, sanitized text representation of the detected math problem or equation."
            },
            solved: {
              type: Type.BOOLEAN,
              description: "True if successfully solved, false if could not be solved."
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step breakdown explaining how the problem is solved."
            },
            finalAnswer: {
              type: Type.STRING,
              description: "The final computed result or value."
            },
            conceptsExplained: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING, description: "Name of the mathematical concept, theory, or rule." },
                  explanation: { type: Type.STRING, description: "Clear, understandable explanation of the concept." }
                },
                required: ["concept", "explanation"]
              },
              description: "Key concepts involved in solving this specific problem."
            },
            youtubeQueries: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended search terms for finding high-quality YouTube tutorials on these specific concepts."
            }
          },
          required: ["problem", "solved", "steps", "finalAnswer", "conceptsExplained", "youtubeQueries"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error solving math problem:", error);
    res.status(500).json({ error: error.message || "An error occurred while solving the problem." });
  }
});

// Formula Explanation & Math Concept Search Endpoint
app.post("/api/formula-explain", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getAiClient();
    const prompt = `Provide an exhaustive explanation of the mathematical concept, theorem, or formula: "${query}". Respond with high educational accuracy and detailed formulas in standard mathematical or LaTeX notation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formulaName: { type: Type.STRING, description: "The standard name of the math concept or formula." },
            expression: { type: Type.STRING, description: "The core formula expression, equation, or theorem in mathematical syntax or LaTeX." },
            description: { type: Type.STRING, description: "Exhaustive description of what this formula calculates and what its components represent." },
            historyAndContext: { type: Type.STRING, description: "Historical origin, who discovered/developed it, and its mathematical significance." },
            proofOrDerivation: { type: Type.STRING, description: "An educational derivation or conceptual proof showing why the formula works." },
            realWorldApplications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Fields or practical real-world scenarios where this formula is actively applied."
            },
            workedExample: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING, description: "A realistic test question using this formula." },
                solutionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Step-by-step calculation showing how to arrive at the solution."
                },
                answer: { type: Type.STRING, description: "The final answer to the worked example." }
              },
              required: ["problem", "solutionSteps", "answer"]
            },
            youtubeQueries: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Highly targeted search phrases to find quality step-by-step videos on YouTube."
            }
          },
          required: ["formulaName", "expression", "description", "historyAndContext", "proofOrDerivation", "realWorldApplications", "workedExample", "youtubeQueries"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error explaining formula:", error);
    res.status(500).json({ error: error.message || "An error occurred while explaining the formula." });
  }
});

// Interactive Quiz Generation Endpoint
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { topic, contextProblem } = req.body;
    const ai = getAiClient();

    const systemInstructions = "You are an encouraging and premium mathematics professor. Create an interactive quiz of exactly 3 high-quality multiple choice questions testing concepts on the requested topic or matching the style and logic of the provided solved problem.";
    
    const prompt = `Create a mathematical quiz.
Topic requested: ${topic || "General Mathematics"}
${contextProblem ? `The quiz should be directly inspired by, or test related concepts of, this solved math problem:\n"${contextProblem}"` : ""}

Generate exactly 3 multiple-choice questions. Ensure all options are plausible but only one is correct. Provide a comprehensive, step-by-step explanation showing the math calculations to arrive at the correct answer.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING, description: "Creative, encouraging title for this specific quiz." },
            topic: { type: Type.STRING, description: "Specific math subject covered." },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING, description: "The math question, clearly formulated. Use standard notation." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options, containing the correct answer."
                  },
                  correctAnswer: { type: Type.STRING, description: "The exact matching string of the correct answer from the options list." },
                  explanation: { type: Type.STRING, description: "Step-by-step mathematical breakdown explaining how to solve it." }
                },
                required: ["id", "question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["quizTitle", "topic", "questions"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating your quiz." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
