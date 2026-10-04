import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  checkInputLimits,
  LIMITS,
  validateCodeGenResult,
  validateCodeDebugResult,
  validateCodeExplanationResult,
  validateCodeOptimizationResult,
  validateCodeTestCasesResult,
  validateLogicValidationResult,
  validateLogicCodeMatchResult,
  validateCodeConvertResult,
  validateDedicatedDryRunResult,
  validatePracticeProblem,
  validatePracticeHint,
  validatePracticeLogicCheck,
  validatePracticeSolution,
  validateCombinedAnalysis,
} from './src/services/aiValidators';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Sensible request size limit
app.use(express.json({ limit: '2mb' }));

// Basic sliding-window rate limiting for /api/ routes to protect against abuse
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS' || req.path === '/health') {
    return next();
  }
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
  const now = Date.now();
  const clientData = ipRequestCounts.get(ip);

  if (!clientData || now > clientData.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  clientData.count++;
  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before trying again.',
    });
  }

  return next();
});

// Periodic memory cleanup of rate limit store
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now > data.resetTime) {
      ipRequestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];

function formatErrorForClient(
  err: any,
  fallback = 'Something went wrong while analyzing your code. Please try again.'
): string {
  if (!err) return fallback;
  const msg = typeof err === 'string' ? err : err.message || '';
  if (msg.includes('GEMINI_API_KEY')) {
    return 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.';
  }
  if (
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('429')
  ) {
    return 'AI service is currently experiencing high demand. Please try again in a few moments.';
  }
  if (msg.includes('too large') || msg.includes('exceeds maximum allowed size')) {
    return msg;
  }
  return fallback;
}

// Robust helper with exponential backoff retry & fallback models
async function generateWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err.message || '').toLowerCase();
        const errStatus = err.status || err.statusCode;

        // Non-retryable / fatal errors (Section 6): immediately abort without redundant model loops
        const isFatal =
          errStatus === 400 ||
          errStatus === 401 ||
          errStatus === 403 ||
          errStatus === 404 ||
          errMsg.includes('api key') ||
          errMsg.includes('permission_denied') ||
          errMsg.includes('invalid_argument') ||
          errMsg.includes('bad request') ||
          errMsg.includes('unsupported request');

        if (isFatal) {
          throw err;
        }

        // Transient errors that qualify for retry and model fallback
        const isTransient =
          errStatus === 429 ||
          errStatus === 503 ||
          errMsg.includes('503') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('econnreset') ||
          errMsg.includes('etimedout') ||
          errMsg.includes('fetch failed');

        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

// Helper to extract JSON safely without crashing (Section 8)
function parseModelJson<T>(rawText: string | undefined): T {
  if (!rawText || !rawText.trim()) {
    throw new Error('AI returned an invalid response. Please try again.');
  }
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // If there is commentary before/after JSON, find the outermost { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const extracted = cleaned.substring(firstBrace, lastBrace + 1);
        return JSON.parse(extracted) as T;
      } catch {
        // Fallback recovery failed
      }
    }
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        const extracted = cleaned.substring(firstBracket, lastBracket + 1);
        return JSON.parse(extracted) as T;
      } catch {
        // Fallback recovery failed
      }
    }
    throw new Error('AI returned an invalid response. Please try again.');
  }
}

// 1. Code Generation Endpoint (Logic -> Code)
app.post('/api/generate-code', async (req, res) => {
  try {
    const { problem, logic, language, difficulty } = req.body;

    if (!logic && !problem) {
      return res.status(400).json({ error: 'Please provide a problem statement or logic/algorithm description.' });
    }

    checkInputLimits(problem, 'Problem Statement', LIMITS.problemStatement);
    checkInputLimits(logic, 'Logic Description', LIMITS.logicDescription);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI, an expert programming assistant and computer science educator.
Prioritize: Correctness -> Understanding -> Code Generation.
Convert natural language algorithms, pseudocode, and step-by-step thinking into clean, working, idiomatic code in ${language || 'python'}.
If the user's logic is flawed, address the flaw and generate correct code while explaining the adjustments in keySteps.
Include pseudocode, algorithm name, time/space complexity, edge cases, and an illustrative example input/output.
Return strictly valid JSON.`;

    const prompt = `Target Language: ${language || 'python'}
Difficulty: ${difficulty || 'Beginner'}

Problem Statement:
${problem || 'Solve the described logic'}

User's Logic / Algorithm / Pseudocode:
${logic}

Generate a comprehensive JSON response matching this schema:
{
  "understanding": "Clear summary of the problem and the algorithmic approach",
  "algorithm": "Name of the algorithm/technique (e.g. 'Two Pointers', 'Sliding Window', 'Linear Scan')",
  "pseudocode": "Clean, structured step-by-step pseudocode",
  "code": "The complete, working source code with clean formatting and educational inline comments",
  "example": {
    "input": "Concrete sample input",
    "output": "Expected output from the sample input",
    "explanation": "Brief walkthrough of how the sample input produced the output"
  },
  "timeComplexity": "Big-O notation with short explanation (e.g. 'O(N) - single linear pass')",
  "spaceComplexity": "Big-O notation with short explanation (e.g. 'O(1) - constant auxiliary memory')",
  "edgeCases": [
    "Edge case 1 (e.g. empty collection)",
    "Edge case 2 (e.g. all negative numbers)"
  ],
  "keySteps": [
    "Step 1 description",
    "Step 2 description",
    "Step 3 description"
  ]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateCodeGenResult(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/generate-code:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while generating code. Please try again.'),
    });
  }
});

// 2. Debug My Code Endpoint
app.post(['/api/debug-code', '/api/review-code'], async (req, res) => {
  try {
    const { code, language, expectedBehavior } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Please provide code to debug.' });
    }

    checkInputLimits(code, 'Source Code', LIMITS.sourceCode);
    checkInputLimits(expectedBehavior, 'Expected Behavior', LIMITS.problemStatement);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Debugger & Code Mentor.
Analyze user code for:
- Syntax errors
- Logical errors & off-by-one errors
- Runtime problems (null/undefined pointers, divide by zero, out of bounds)
- Incorrect conditions & loops
- Variable scoping or mutation issues
- Unhandled edge cases
- Inefficient implementations
DO NOT silently rewrite the entire code.
Classify each issue clearly:
- issue title
- severity ('critical' | 'warning' | 'note')
- category ('Syntax' | 'Logical' | 'Runtime' | 'Condition' | 'Loop' | 'Variable' | 'Edge Case' | 'Efficiency')
- whyItHappens: explanation of root cause
- howToFix: concrete instruction
Provide the corrected code and a clear explanation of changes.
Return strictly valid JSON.`;

    const prompt = `Language: ${language || 'python'}
${expectedBehavior ? `Intended Behavior / Problem: ${expectedBehavior}\n` : ''}

Code to Debug:
\`\`\`
${code}
\`\`\`

Return a JSON object structured as:
{
  "status": "Correct" | "Needs Fix",
  "summary": "High-level summary of code correctness and bugs found",
  "problemsFound": [
    {
      "issue": "Title of bug or issue",
      "severity": "critical" | "warning" | "note",
      "category": "Syntax" | "Logical" | "Runtime" | "Condition" | "Loop" | "Variable" | "Edge Case" | "Efficiency",
      "whyItHappens": "Why this bug or problem happens",
      "howToFix": "How to fix it concretely"
    }
  ],
  "correctedCode": "Corrected source code with fixes applied and comments highlighting fixes",
  "explanationOfChanges": [
    "Explanation of change 1",
    "Explanation of change 2"
  ],
  "timeComplexity": "e.g. 'O(N)'",
  "spaceComplexity": "e.g. 'O(1)'",
  "edgeCasesChecked": [
    "Edge case 1 verified",
    "Edge case 2 verified"
  ]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateCodeDebugResult(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/debug-code:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while analyzing your code. Please try again.'),
    });
  }
});

// 3. Code Explainer Endpoint
app.post('/api/explain-code', async (req, res) => {
  try {
    const { code, language, difficulty } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Please provide code to explain.' });
    }

    checkInputLimits(code, 'Source Code', LIMITS.sourceCode);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const targetDifficulty = difficulty || 'Beginner';

    const systemInstruction = `You are Logic2Code AI Code Explainer, a master teacher of computer science.
Explain code clearly and systematically adapted to the user's selected difficulty: ${targetDifficulty}.
If Beginner: Use simple language, plain analogies, avoid confusing jargon without defining it, explain control flow step by step.
If Intermediate: Focus on algorithmic structure, language idioms, and data flow.
If Advanced: Focus on memory layout, algorithmic trade-offs, and micro-optimizations.
Provide a complete breakdown: overall purpose, stepByStep, lineByLine, variables, functions, algorithm, a sample dry run trace, and complexity.
Return strictly valid JSON.`;

    const prompt = `Language: ${language || 'python'}
Target Audience: ${targetDifficulty}

Source Code:
\`\`\`
${code}
\`\`\`

Return a JSON object structured as:
{
  "overallPurpose": "High-level summary of what this code accomplishes",
  "stepByStep": [
    {
      "stepNumber": 1,
      "title": "Short title for this logical phase",
      "explanation": "Clear explanation of this step"
    }
  ],
  "lineByLine": [
    {
      "lines": "Line or snippet",
      "explanation": "What happens on these lines",
      "importance": "key" | "standard"
    }
  ],
  "variables": [
    {
      "name": "variable_name",
      "type": "type name",
      "role": "role description",
      "purpose": "What information it stores and how it updates"
    }
  ],
  "functions": [
    {
      "name": "function_name",
      "parameters": "parameter names",
      "returns": "return type/description",
      "purpose": "What this function does"
    }
  ],
  "algorithm": "Algorithmic principle applied",
  "dryRun": {
    "sampleInput": "A small test input",
    "traceSteps": [
      {
        "step": 1,
        "currentLineOrAction": "Action description",
        "state": "Variable values at this step",
        "explanation": "Explanation of state transition"
      }
    ],
    "finalOutput": "Final return value"
  },
  "timeComplexity": {
    "bigO": "e.g. O(N)",
    "explanation": "Why this time complexity occurs"
  },
  "spaceComplexity": {
    "bigO": "e.g. O(1)",
    "explanation": "Why this space complexity occurs"
  }
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateCodeExplanationResult(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/explain-code:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while explaining your code. Please try again.'),
    });
  }
});

// 4. Optimize My Code Endpoint
app.post('/api/optimize-code', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Please provide code to optimize.' });
    }

    checkInputLimits(code, 'Source Code', LIMITS.sourceCode);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Code Optimizer.
Analyze the user's code for:
- Current time & space complexity
- Bottlenecks
- Repeated work or redundant recalculations
- Unnecessary nested loops
- Suboptimal data structure choices
- Superior algorithmic choices
IMPORTANT RULES:
- DO NOT optimize if it changes the intended behavior or output.
- If the current solution is already reasonably optimal, explicitly state in optimizedApproach and whyThisIsBetter: "No significant optimization is necessary." Keep optimizedCode identical or with clean formatting only. Do not force an unnecessary or convoluted optimization.
Return strictly valid JSON.`;

    const prompt = `Language: ${language || 'python'}

Code to Optimize:
\`\`\`
${code}
\`\`\`

Return a JSON object structured as:
{
  "currentApproach": "Description of the current algorithmic approach",
  "currentComplexity": {
    "time": "Current time complexity (e.g. O(N^2))",
    "space": "Current space complexity (e.g. O(1))"
  },
  "problems": [
    "Problem or bottleneck 1",
    "Problem or bottleneck 2"
  ],
  "bottlenecks": [
    "Specific line or section causing slowdown"
  ],
  "optimizedApproach": "Explanation of the superior algorithmic strategy (or 'No significant optimization is necessary' if already optimal)",
  "newComplexity": {
    "time": "Optimized time complexity (e.g. O(N))",
    "space": "Optimized space complexity (e.g. O(N))"
  },
  "optimizedCode": "The fully optimized source code with clean comments (keep identical if already optimal)",
  "whyThisIsBetter": [
    "Specific reason 1 why this is faster or uses less memory",
    "Specific reason 2"
  ]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateCodeOptimizationResult(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/optimize-code:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while optimizing your code. Please try again.'),
    });
  }
});

// 5. Test My Code Endpoint
app.post('/api/test-code', async (req, res) => {
  try {
    const { code, language, expectedBehavior } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Please provide code to generate test cases for.' });
    }

    checkInputLimits(code, 'Source Code', LIMITS.sourceCode);
    checkInputLimits(expectedBehavior, 'Expected Behavior', LIMITS.problemStatement);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Test Architect.
Analyze the user's code and generate comprehensive test cases covering:
1. Normal cases (typical inputs)
2. Boundary cases (limits, min/max values)
3. Edge cases (empty arrays, zero, negative numbers, single element)
4. Invalid cases (where appropriate for error handling)
Do NOT claim that the code was executed in a sandbox. These are AI-generated static analysis test cases.
Return strictly valid JSON.`;

    const prompt = `Language: ${language || 'python'}
${expectedBehavior ? `Expected Behavior: ${expectedBehavior}\n` : ''}

Code to analyze:
\`\`\`
${code}
\`\`\`

Generate a JSON object with:
{
  "summary": "Overview of test strategy for this code",
  "testCases": [
    {
      "id": 1,
      "type": "Normal" | "Boundary" | "Edge Case" | "Invalid",
      "input": "Concrete input description or value",
      "expectedOutput": "Expected return value or behavior",
      "purpose": "What this test verifies (e.g. 'Verifies empty list returns -1 safely')"
    }
  ],
  "note": "These test cases are generated using AI-based static analysis. The code has not been executed."
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateCodeTestCasesResult(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/test-code:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while generating test cases. Please try again.'),
    });
  }
});

// 6. Validate My Logic Endpoint
app.post('/api/validate-logic', async (req, res) => {
  try {
    const { problem, logic } = req.body;

    if (!logic || !logic.trim()) {
      return res.status(400).json({ error: 'Please provide your logic or algorithm to validate.' });
    }

    checkInputLimits(problem, 'Problem Statement', LIMITS.problemStatement);
    checkInputLimits(logic, 'Algorithm Logic', LIMITS.logicDescription);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Logic Validator and Algorithmic Judge.
Prioritize: Correctness -> Understanding -> Guidance.
Determine:
- Whether the stated logic is correct for the problem
- What assumptions it makes
- Edge cases
- If the logic is wrong or flawed, give a simple concrete counterexample!
- Identify problems in reasoning
- Provide improved, corrected logic
- Estimate expected time and space complexity
Do NOT blindly generate code if the logic is wrong.
Return strictly valid JSON.`;

    const prompt = `Problem Statement:
${problem || 'General programming problem'}

User's Stated Logic / Approach:
${logic}

Generate a JSON object structured as:
{
  "isCorrect": true | false,
  "verdict": "Correct" | "Flawed" | "Partially Correct",
  "summary": "Detailed assessment of the reasoning",
  "assumptions": [
    "Assumption 1 (e.g. assumes array is non-empty)",
    "Assumption 2"
  ],
  "problemsInReasoning": [
    "Flaw 1 (if any)",
    "Flaw 2"
  ],
  "counterexample": {
    "input": "Simple input that causes the logic to fail (e.g. nums = [-5, -2, -9])",
    "whyItFails": "Why the user logic produces the wrong answer or crashes",
    "expectedOutcome": "What the correct outcome should have been"
  },
  "edgeCases": [
    "Edge case 1",
    "Edge case 2"
  ],
  "improvedLogic": "Corrected, robust algorithmic logic described step-by-step",
  "expectedComplexity": {
    "time": "Expected time complexity (e.g. O(N))",
    "space": "Expected space complexity (e.g. O(1))"
  }
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateLogicValidationResult(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/validate-logic:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while validating your logic. Please try again.'),
    });
  }
});

// 7. Logic vs Code Checker ("Does My Code Follow My Logic?")
app.post('/api/check-logic-vs-code', async (req, res) => {
  try {
    const { problem, logic, code, language } = req.body;

    if (!logic || !code) {
      return res.status(400).json({ error: 'Both Expected Logic and User Code are required.' });
    }

    checkInputLimits(problem, 'Problem Statement', LIMITS.problemStatement);
    checkInputLimits(logic, 'Expected Logic', LIMITS.logicDescription);
    checkInputLimits(code, 'Source Code', LIMITS.sourceCode);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Logic vs Code Alignment Checker.
Compare the user's Expected Logic against the Actual Code Implementation:
- Determine if the code: "Matches" | "Partially Matches" | "Does Not Match"
- Highlight where the code followed the logic and where it deviated
- Determine whether it correctly solves the problem
- Explain the discrepancies
- Provide corrected code that aligns the implementation with the expected logic.
Return strictly valid JSON.`;

    const prompt = `Language: ${language || 'python'}
${problem ? `Problem: ${problem}\n` : ''}

Expected Logic:
${logic}

User Code:
\`\`\`
${code}
\`\`\`

Return a JSON object structured as:
{
  "matchStatus": "Matches" | "Partially Matches" | "Does Not Match",
  "summary": "Overview of how closely the code follows the stated logic",
  "differences": [
    "Difference 1: Where the code deviated from the logic",
    "Difference 2"
  ],
  "solvesProblem": true | false,
  "explanation": "Detailed explanation of whether the code faithfully implements the logic and solves the problem",
  "correctedCode": "Code corrected to match the expected logic faithfully"
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateLogicCodeMatchResult(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/check-logic-vs-code:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while comparing code against logic. Please try again.'),
    });
  }
});

// 8. Convert Code Endpoint
app.post('/api/convert-code', async (req, res) => {
  try {
    const { code, sourceLanguage, targetLanguage } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Please provide code to convert.' });
    }

    if (sourceLanguage && targetLanguage && sourceLanguage === targetLanguage) {
      return res.status(400).json({ error: 'Source and target languages must be different.' });
    }

    checkInputLimits(code, 'Source Code', LIMITS.sourceCode);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Language Conversion Specialist.
Convert source code from ${sourceLanguage} to ${targetLanguage}.
Ensure:
- Idiomatic translation for ${targetLanguage} (e.g. types, memory management, naming conventions, standard library)
- Identical algorithmic logic and edge case handling
- Clear explanation of important language-specific differences (memory, syntax, typing, data structures)
Return strictly valid JSON.`;

    const prompt = `Source Language: ${sourceLanguage}
Target Language: ${targetLanguage}

Original Code:
\`\`\`${sourceLanguage}
${code}
\`\`\`

Return a JSON object structured as:
{
  "sourceLanguage": "${sourceLanguage}",
  "targetLanguage": "${targetLanguage}",
  "convertedCode": "The fully converted, idiomatically written code in ${targetLanguage}",
  "keyDifferences": [
    "Language difference 1 (e.g. static typing vs dynamic)",
    "Language difference 2 (e.g. 0-indexing, memory or collection differences)"
  ],
  "languageSpecificNotes": [
    "Important idiom or best-practice note in ${targetLanguage}"
  ]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateCodeConvertResult(parsed, sourceLanguage, targetLanguage);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/convert-code:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while converting your code. Please try again.'),
    });
  }
});

// 9. Dedicated Dry Run Endpoint ("Run Dry Run")
app.post('/api/dry-run', async (req, res) => {
  try {
    const { code, language, sampleInput } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Please provide code for the dry run.' });
    }

    checkInputLimits(code, 'Source Code', LIMITS.sourceCode);
    checkInputLimits(sampleInput, 'Sample Input', LIMITS.problemStatement);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Dry Run Visualizer.
Simulate step-by-step execution of code on the provided sample input.
Clearly label this as: "AI-generated execution walkthrough. This is not a sandbox execution result." Do NOT claim the code was executed in a real sandbox.
Track:
- Step number
- Current line or action
- Variable changes and values (e.g. i=0, max=10, arr[0]=10)
- Loop iterations
- If recursion exists, track the call stack state
- Final computed output
Return strictly valid JSON.`;

    const prompt = `Language: ${language || 'python'}
Sample Input: ${sampleInput || 'Default test input'}

Code to Dry Run:
\`\`\`
${code}
\`\`\`

Return a JSON object structured as:
{
  "sampleInput": "${sampleInput || 'Default test input'}",
  "finalOutput": "Final return value or output",
  "explanation": "High-level summary of the execution walkthrough",
  "traceSteps": [
    {
      "step": 1,
      "currentLineOrAction": "Description of action or line",
      "state": "Variable state summary (e.g. 'i=0, num=10, max=10')",
      "explanation": "What happened during this iteration or statement",
      "callStack": ["main()", "helper(n=3)"]
    }
  ]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateDedicatedDryRunResult(parsed, sampleInput || 'Default test input');
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/dry-run:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while simulating execution. Please try again.'),
    });
  }
});

// 10. Practice Mode: Generate Problem
app.post('/api/practice/generate-problem', async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Practice Coach.
Generate a high-quality algorithmic coding challenge on topic: ${topic || 'Arrays'} with difficulty: ${difficulty || 'Easy'}.
The user should first attempt the logic, not just look at code.
Do NOT reveal the full solution in the problem prompt.
Return strictly valid JSON.`;

    const prompt = `Generate a programming challenge for Topic: ${topic || 'Arrays'}, Difficulty: ${difficulty || 'Easy'}.

Return a JSON object structured as:
{
  "id": "prob_${Date.now()}",
  "topic": "${topic || 'Arrays'}",
  "difficulty": "${difficulty || 'Easy'}",
  "title": "Clear concise challenge title",
  "problemStatement": "Detailed description of the task, input format, and output format",
  "constraints": [
    "Constraint 1 (e.g. 1 <= N <= 10^5)",
    "Constraint 2"
  ],
  "examples": [
    {
      "input": "Sample Input 1",
      "output": "Sample Output 1",
      "explanation": "Walkthrough of example"
    },
    {
      "input": "Sample Input 2",
      "output": "Sample Output 2"
    }
  ]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validatePracticeProblem(parsed, topic || 'Arrays', difficulty || 'Easy');
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/practice/generate-problem:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while generating practice challenge. Please try again.'),
    });
  }
});

// 11. Practice Mode: Progressive Hint
app.post('/api/practice/hint', async (req, res) => {
  try {
    const { problem, userLogic, hintLevel } = req.body;

    checkInputLimits(problem, 'Problem Statement', LIMITS.problemStatement);
    checkInputLimits(userLogic, 'User Logic', LIMITS.logicDescription);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const level = Number(hintLevel) || 1;

    const systemInstruction = `You are Logic2Code AI Practice Mentor.
Provide a PROGRESSIVE hint for the coding challenge.
HINT RULES:
- Level 1: Conceptual nudge on what data structure or approach to consider without spoiling the algorithm.
- Level 2: Specific algorithmic direction (e.g. two pointers, sorting first, hash map key strategy).
- Level 3: Detailed pseudocode outline or key invariant to maintain.
DO NOT immediately reveal the complete solution or full code!
Return strictly valid JSON.`;

    const prompt = `Problem:
${problem}

User's Current Logic/Thinking:
${userLogic || 'Not provided yet'}

Requested Hint Level: ${level} of 3

Return a JSON object:
{
  "hintLevel": ${level},
  "totalHints": 3,
  "hint": "The progressive hint text for level ${level}",
  "guidance": "Encouraging question or thought prompt to guide user thinking"
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validatePracticeHint(parsed, level);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/practice/hint:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while retrieving hint. Please try again.'),
    });
  }
});

// 12. Practice Mode: Check Logic
app.post('/api/practice/check-logic', async (req, res) => {
  try {
    const { problem, userLogic } = req.body;

    if (!userLogic || !userLogic.trim()) {
      return res.status(400).json({ error: 'Please write your logic first.' });
    }

    checkInputLimits(problem, 'Problem Statement', LIMITS.problemStatement);
    checkInputLimits(userLogic, 'User Logic', LIMITS.logicDescription);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Practice Evaluator.
The user has submitted their proposed logic for a practice problem before coding.
Assess:
- Is the logic viable and correct?
- If correct: encourage them to proceed to code.
- If flawed: point out the specific missing step or edge case without giving the complete code away.
Return strictly valid JSON.`;

    const prompt = `Problem:
${problem}

User Proposed Logic:
${userLogic}

Return JSON:
{
  "isViable": true | false,
  "feedback": "Constructive evaluation of the proposed logic",
  "suggestions": [
    "Actionable suggestion 1",
    "Actionable suggestion 2"
  ]
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validatePracticeLogicCheck(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/practice/check-logic:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while evaluating logic. Please try again.'),
    });
  }
});

// 13. Practice Mode: Show Solution
app.post('/api/practice/solution', async (req, res) => {
  try {
    const { problem, language } = req.body;

    checkInputLimits(problem, 'Problem Statement', LIMITS.problemStatement);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Practice Mentor.
Provide the optimal, idiomatic, fully commented solution in ${language || 'python'} for the practice challenge.
Explain the algorithm, time complexity, and space complexity clearly.
Return strictly valid JSON.`;

    const prompt = `Language: ${language || 'python'}
Problem:
${problem}

Return JSON:
{
  "code": "The complete, working source code with comments",
  "language": "${language || 'python'}",
  "algorithm": "Name of optimal algorithm",
  "explanation": "Clear explanation of how the optimal solution works",
  "timeComplexity": "e.g. O(N)",
  "spaceComplexity": "e.g. O(1)"
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validatePracticeSolution(parsed, language || 'python');
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/practice/solution:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while retrieving solution. Please try again.'),
    });
  }
});

// 14. Combined 3-Way Triangulation (Preserved)
app.post('/api/analyze-problem', async (req, res) => {
  try {
    const { problem, logic, code, language } = req.body;

    if (!problem || !logic || !code) {
      return res.status(400).json({
        error: 'Problem Statement, Logic/Algorithm, and Code are all required for 3-way analysis.',
      });
    }

    checkInputLimits(problem, 'Problem Statement', LIMITS.problemStatement);
    checkInputLimits(logic, 'Stated Logic', LIMITS.logicDescription);
    checkInputLimits(code, 'Source Code', LIMITS.sourceCode);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Triangulation Engine.
Compare three elements:
1. Problem Statement
2. Stated Logic/Approach
3. Source Code Implementation
Evaluate:
- Does the code solve the problem?
- Does the code faithfully implement the user's stated logic?
- Discrepancies between logic and code
- Edge cases missed
- Efficiency
Return strictly valid JSON.`;

    const prompt = `Language: ${language || 'python'}

Problem Statement:
${problem}

User's Stated Logic:
${logic}

User's Code Implementation:
\`\`\`
${code}
\`\`\`

Generate a JSON object matching:
{
  "solvesProblem": {
    "verdict": true | false,
    "explanation": "Does the code solve the stated problem?"
  },
  "followsLogic": {
    "verdict": true | false,
    "explanation": "Did the code follow the user's algorithm, or did it deviate?"
  },
  "logicalMistakes": [
    "Logical mistake 1 (if any)"
  ],
  "missingEdgeCases": [
    "Missing edge case 1",
    "Missing edge case 2"
  ],
  "efficiencyVerdict": "Evaluation of time and space efficiency",
  "suggestedImprovements": [
    "Concrete improvement 1",
    "Concrete improvement 2"
  ],
  "overallSummary": "A concise concluding assessment",
  "correctedCode": "The fully aligned, corrected code adhering to the user's approach"
}`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseModelJson(response.text);
    const validated = validateCombinedAnalysis(parsed);
    return res.json(validated);
  } catch (err: any) {
    console.error('Error in /api/analyze-problem:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Something went wrong while analyzing the problem. Please try again.'),
    });
  }
});

// 15. Follow-up Contextual Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    checkInputLimits(message, 'Message', LIMITS.chatMessage);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'AI service is temporarily unavailable. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemInstruction = `You are Logic2Code AI Assistant, an interactive programming tutor.
You help programmers, students, and software developers understand their code, tweak logic, convert code across languages, optimize algorithms, and debug edge cases.
Always stay focused on the user's active context (problem, logic, code, language).
Keep answers crisp, encouraging, pedagogical, and formatted in clean Markdown with code blocks.`;

    let contextSummary = '';
    if (context) {
      contextSummary = `Active Workspace Context:
- Language: ${context.language || 'Not specified'}
${context.problem ? `- Problem: ${context.problem}\n` : ''}
${context.logic ? `- Logic/Approach: ${context.logic}\n` : ''}
${context.code ? `- Current Code:\n\`\`\`${context.language || ''}\n${context.code}\n\`\`\`\n` : ''}
---`;
    }

    // Format prompt with bounded recent conversation history (max 10 messages)
    let conversationText = '';
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      conversationText = recentHistory
        .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${String(h.content || '').slice(0, 1500)}`)
        .join('\n\n');
      conversationText += '\n\n';
    }

    const fullPrompt = `${contextSummary}\n\n${conversationText}User: ${message}\nAssistant:`;

    const response = await generateWithFallback({
      contents: fullPrompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I could not generate a response.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({
      error: formatErrorForClient(err, 'Chat service is temporarily unavailable. Please try again.'),
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: PRIMARY_MODEL,
  });
});

// Full-stack Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const safeguard = `<script>(function(){try{var w=typeof window!=='undefined'?window:globalThis;if(!w)return;var p=typeof Window!=='undefined'?Window.prototype:null;var cf=w.fetch;function mk(d){return{get:function(){return this._app_fetch||(d&&d.get?d.get.call(this):cf);},set:function(fn){this._app_fetch=fn;try{Object.defineProperty(this,'fetch',{value:fn,writable:true,configurable:true,enumerable:true});}catch(e){}},configurable:true,enumerable:true};}if(p){try{var pd=Object.getOwnPropertyDescriptor(p,'fetch');Object.defineProperty(p,'fetch',mk(pd));}catch(e){}}try{var wd=Object.getOwnPropertyDescriptor(w,'fetch');Object.defineProperty(w,'fetch',mk(wd));}catch(e){}}catch(e){}})();</script>`;
        if (!template.includes('this._app_fetch')) {
          template = template.replace('<head>', `<head>${safeguard}`);
        } else {
          // Move the safeguard script before everything in head
          template = template.replace('<head>', `<head>${safeguard}`);
        }
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Logic2Code AI server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
