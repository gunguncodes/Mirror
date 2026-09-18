import http from "node:http";
import { GoogleGenAI } from "@google/genai";

const PORT = 3001;
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const MAX_RETRIES = 2;

const evaluationSchema = {
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

        required: [
          "category",
          "status",
          "explanation",
          "quotes",
        ],
      },
    },

    recommendations: {
      type: "array",
      description:
        "Concrete, candidate-controlled actions based only on the supplied application.",
      items: {
        type: "object",
        properties: {
          issue: {
            type: "string",
          },

          evidence: {
            type: "array",
            items: {
              type: "string",
            },
          },

          whyItMatters: {
            type: "string",
          },

          action: {
            type: "string",
          },

          suggestedRevision: {
            type: "string",
          },
        },

        required: [
          "issue",
          "evidence",
          "whyItMatters",
          "action",
          "suggestedRevision",
        ],
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
    "recommendations",
    "disclaimer",
  ],
};

const comparisonSchema = {
  type: "object",
  properties: {
    originalScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },

    revisedScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },

    scoreDifference: {
      type: "integer",
    },

    confidence: {
      type: "string",
      enum: ["Low", "Moderate", "High"],
    },

    summary: {
      type: "string",
    },

    changes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
          },

          direction: {
            type: "string",
            enum: [
              "Improved signal",
              "Reduced signal",
              "No meaningful change",
            ],
          },

          explanation: {
            type: "string",
          },

          originalEvidence: {
            type: "array",
            items: {
              type: "string",
            },
          },

          revisedEvidence: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },

        required: [
          "category",
          "direction",
          "explanation",
          "originalEvidence",
          "revisedEvidence",
        ],
      },
    },

    disclaimer: {
      type: "string",
    },
  },

  required: [
    "originalScore",
    "revisedScore",
    "scoreDifference",
    "confidence",
    "summary",
    "changes",
    "disclaimer",
  ],
};

const systemInstruction = `
You are Mirror, an educational simulation that helps job seekers understand
how automated hiring systems might interpret application language.

You are NOT predicting whether a person will get hired.

Mirror uses controlled comparisons to make observable screening patterns easier
to understand.

GENERAL RULES:

1. Never claim to know an employer's actual hiring algorithm.
2. Never predict rejection, acceptance, interviews, or hiring.
3. Never infer disability, medical conditions, diagnoses, or neurodivergence.
4. If disability-related information is explicitly present, discuss only the
   possible screening implications of its presence.
5. Never advise someone to hide or remove a disability.
6. Never fabricate evidence.
7. Separate observable language patterns from interpretation.
8. The score is a simulated screening signal, NOT an employability score.
9. Do not invent facts about the candidate.
10. Keep the analysis respectful and non-deterministic.

RECOMMENDATION RULES:

1. Recommendations must be based only on the supplied application.
2. Do not invent experience, technologies, achievements, metrics, employers,
   projects, education, or qualifications.
3. Do not tell the candidate to add something they have not demonstrated.
4. Focus on candidate-controlled improvements such as clarity, specificity,
   action wording, role alignment, organization, and evidence.
5. Every recommendation must contain exact evidence from the application when
   relevant.
6. Evidence must be copied exactly. Never fabricate or combine quotes.
7. Suggested revisions may improve wording but must preserve the candidate's
   underlying meaning and claimed experience.
8. Do not recommend hiding disability, accommodation needs, or identity.
9. If the application is already strong in an area, do not manufacture an issue.
10. Prefer a small number of high-value recommendations over generic advice.
11. Suggestions should be practical enough for the candidate to apply directly.

COMPARISON RULES:

1. Compare Version A and Version B using the SAME evaluation framework.
2. Treat Version A as the original and Version B as the controlled revision.
3. Focus on observable changes in language, specificity, experience evidence,
   role alignment, communication clarity, and other selected screening signals.
4. Do not assume that Version B is better simply because it is different.
5. Only describe an improvement or reduction when the supplied text supports it.
6. If a category did not meaningfully change, say so.
7. Every evidence excerpt MUST be copied exactly from the corresponding
   application version.
8. Never create a quote by combining text from multiple places.
9. Never claim that a score difference represents a real employer's behavior.
10. A score difference is only a result of this simulation.
11. Keep changes focused and meaningful rather than producing a long list.
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

      if (body.length > 250000) {
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

function createGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,

    httpOptions: {
      timeout: 30000,
    },
  });
}

function isTemporaryGeminiError(error) {
  const status = error?.status ?? error?.code;

  const message = String(error?.message || "").toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("503") ||
    message.includes("high demand") ||
    message.includes("unavailable") ||
    message.includes("temporarily") ||
    message.includes("deadline exceeded")
  );
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function generateWithRetry(ai, prompt, schema) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await ai.models.generateContent({
        model: GEMINI_MODEL,

        contents: prompt,

        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
    } catch (error) {
      lastError = error;

      const shouldRetry =
        isTemporaryGeminiError(error) && attempt < MAX_RETRIES;

      if (!shouldRetry) {
        throw error;
      }

      const delay = 1500 * 2 ** attempt;

      console.log(
        `Gemini temporarily unavailable. Retrying in ${delay}ms...`
      );

      await wait(delay);
    }
  }

  throw lastError;
}

async function evaluateApplication(body) {
  const {
    text,
    applicationType,
    role,
    focusAreas,
  } = body;

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Application text is required.");
  }

  const ai = createGeminiClient();

  const prompt = `
${systemInstruction}

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

The response must contain:

1. A simulated screening signal from 0 to 100.
2. A confidence level.
3. Overall reasoning.
4. Observable screening signals.
5. A small set of concrete recommendations the candidate can act on.
6. A clear disclaimer.

RECOMMENDATIONS:

For each recommendation:

- Identify one specific issue or opportunity.
- Quote exact evidence from the application where appropriate.
- Explain why the issue may matter in an automated screening context.
- Give one practical action.
- Give a possible revised version only when a revision can be made
  without inventing experience or qualifications.

Do not manufacture weaknesses simply to create recommendations.

Every piece of evidence must be an exact quote from the application text.
Keep quotes short and directly relevant.

Remember:
This is a simulation of possible automated screening patterns.
It is not an employer's actual score and not a prediction of a hiring outcome.
`;

  const result = await generateWithRetry(
    ai,
    prompt,
    evaluationSchema
  );

  return JSON.parse(result.text);
}

async function compareApplications(body) {
  const {
    originalText,
    revisedText,
    applicationType,
    role,
    focusAreas,
  } = body;

  if (
    !originalText ||
    typeof originalText !== "string" ||
    !originalText.trim()
  ) {
    throw new Error("Original application text is required.");
  }

  if (
    !revisedText ||
    typeof revisedText !== "string" ||
    !revisedText.trim()
  ) {
    throw new Error("Revised application text is required.");
  }

  if (originalText.trim() === revisedText.trim()) {
    throw new Error(
      "Change something in the revised version before comparing."
    );
  }

  const ai = createGeminiClient();

  const prompt = `
${systemInstruction}

Run a controlled Mirror Test comparison.

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

VERSION A — ORIGINAL:
---
${originalText.trim()}
---

VERSION B — CONTROLLED REVISION:
---
${revisedText.trim()}
---

Compare both versions using the SAME simulation framework.

The comparison should focus on what changed in observable screening signals.

Important:

- Version A is the reference.
- Version B is the controlled revision.
- Do not assume Version B is better.
- Do not assume a numerical difference means a real employer would behave
  differently.
- Explain why a signal changed, stayed the same, or became less explicit.
- Quote only exact text from the corresponding version.
- Never fabricate or paraphrase evidence.
- Keep the comparison focused on meaningful changes.

Return the structured comparison.
`;

  const result = await generateWithRetry(
    ai,
    prompt,
    comparisonSchema
  );

  return JSON.parse(result.text);
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

  if (request.method !== "POST") {
    sendJson(response, 405, {
      error: "Method not allowed.",
    });

    return;
  }

  if (
    request.url !== "/api/evaluate" &&
    request.url !== "/api/compare"
  ) {
    sendJson(response, 404, {
      error: "Endpoint not found.",
    });

    return;
  }

  try {
    const body = await readBody(request);

    let result;

    if (request.url === "/api/evaluate") {
      result = await evaluateApplication(body);
    } else {
      result = await compareApplications(body);
    }

    sendJson(response, 200, result);
  } catch (error) {
    console.error("Mirror API error:", error);

    sendJson(response, 500, {
      error:
        error.message ||
        "Mirror could not complete the analysis right now. Please try again.",
    });
  }
});

server.listen(PORT, () => {
  console.log(
    `Mirror API running at http://localhost:${PORT}`
  );
});