import http from "node:http";
import { GoogleGenAI } from "@google/genai";

const PORT = 3001;

const responseSchema = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    confidence: {
      type: "string",
      enum: ["Low", "Moderate", "High"],
    },
    overallReasoning: {
      type: "string",
    },
    signals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
          },
          status: {
            type: "string",
            enum: [
              "Strong signal",
              "Mixed signal",
              "Potential risk",
              "Needs analysis",
            ],
          },
          explanation: {
            type: "string",
          },
          quotes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["category", "status", "explanation", "quotes"],
      },
    },
    disclaimer: {
      type: "string",
    },
  },
  required: [
    "score",
    "confidence",
    "overallReasoning",
    "signals",
    "disclaimer",
  ],
};

const systemInstruction = `
You are Mirror, an educational simulation that helps job seekers understand
how automated hiring systems might interpret application language.

You are NOT predicting whether a person will get hired.

Analyze observable patterns such as:

- relevant experience
- role-specific evidence
- direct versus indirect language
- hedging
- specificity of accomplishments
- communication clarity
- potentially relevant screening signals

IMPORTANT RULES:

1. Never claim to know an employer's actual hiring algorithm.
2. Never predict rejection, acceptance, interviews, or hiring.
3. Never infer disability, medical conditions, diagnoses, or neurodivergence.
4. If disability-related information is explicitly present, discuss only the
   possible screening implications of its presence.
5. Never advise someone to hide or remove a disability.
6. Every quote MUST be copied exactly from the supplied application.
7. Never fabricate evidence.
8. If evidence is insufficient, say so.
9. Clearly distinguish observations from interpretation.
10. The score is a simulated screening signal, NOT an employability score.
11. Return 3 to 5 meaningful signals.
12. Consider the target role and selected focus areas.
13. Do not reward or penalize disability disclosure itself.
14. Do not invent facts about the candidate.

The purpose of Mirror is to make potentially opaque screening patterns more
visible, not to teach candidates how to deceive an employer.
`;

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  response.end(JSON.stringify(data));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 200000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });

    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    response.end();
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/evaluate") {
    sendJson(response, 404, {
      error: "Endpoint not found.",
    });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    sendJson(response, 500, {
      error: "GEMINI_API_KEY is not configured.",
    });
    return;
  }

  try {
    const body = await readBody(request);

    const {
      text,
      applicationType,
      role,
      focusAreas,
    } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      sendJson(response, 400, {
        error: "Application text is required.",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
Analyze this job application using the Mirror framework.

APPLICATION TYPE:
${applicationType || "Not specified"}

TARGET ROLE:
${role || "Not specified"}

FOCUS AREAS:
${
  Array.isArray(focusAreas) && focusAreas.length
    ? focusAreas.join(", ")
    : "General screening signals"
}

APPLICATION TEXT:
---
${text.trim()}
---

Return the structured Mirror analysis.

Every piece of evidence must be an exact quote from the application text.
Keep quotes short and directly relevant.

Remember:
This is a simulation of possible automated screening patterns.
It is not an employer's actual score and not a prediction of a hiring outcome.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `${systemInstruction}\n\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const analysis = JSON.parse(result.text);

    sendJson(response, 200, analysis);
  } catch (error) {
    console.error("Mirror API error:", error);

    sendJson(response, 500, {
      error:
        "Mirror could not complete the analysis right now. Please try again.",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Mirror API running at http://localhost:${PORT}`);
});