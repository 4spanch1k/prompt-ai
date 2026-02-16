import { PromptOptions, EnhancedResult, TargetModelType } from '../types';

/* ══════════════════════════════════════════════════════════
 *  Groq AI Service — PromptCraft AI
 *  Models:
 *    • Text:   llama-3.3-70b-versatile
 *    • Vision: llama-3.2-90b-vision-preview
 * ══════════════════════════════════════════════════════════ */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ─── Shared types ────────────────────────────────────────

/** Response from the simple `enhancePrompt` call. */
export interface GroqResponse {
    enhancedPrompt: string;
}

// ─── Internal helpers ────────────────────────────────────

/**
 * Retrieves the Groq API key from environment variables.
 * @throws {Error} If the key is missing or still set to the placeholder.
 */
function getGroqApiKey(): string {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('GROQ API key is not configured. Add VITE_GROQ_API_KEY to your .env.local file.');
    }
    return apiKey;
}

/**
 * Low-level helper — sends a text-only chat completion request to Groq.
 * @param systemPrompt  - The system instruction.
 * @param userPrompt    - The user message.
 * @param temperature   - Sampling temperature (default 0.7).
 * @param maxTokens     - Maximum tokens in the response (default 512).
 * @returns The trimmed assistant message content.
 */
async function callGroq(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    maxTokens = 512,
): Promise<string> {
    const apiKey = getGroqApiKey();

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature,
            max_tokens: maxTokens,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error?.message ?? `Groq API error: ${response.status}`;
        throw new Error(message);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
        throw new Error('Empty response from Groq API');
    }

    return content;
}

// ═════════════════════════════════════════════════════════
//  1. Simple Enhance  (used by legacy / quick enhance)
// ═════════════════════════════════════════════════════════

const SIMPLE_SYSTEM = `You are an expert prompt engineer specializing in Midjourney and AI image generation.
Your task is to take a user's short, simple idea and expand it into a highly detailed, professional prompt.

Rules:
- Add specific details about lighting (e.g., golden hour, cinematic lighting, soft ambient light)
- Include artistic style references (e.g., hyperrealistic, oil painting, cyberpunk aesthetic, Studio Ghibli)
- Specify camera settings when appropriate (e.g., 85mm lens, shallow depth of field, bird's eye view)
- Add artistic techniques (e.g., volumetric fog, chromatic aberration, double exposure)
- Include mood and atmosphere descriptors
- Output ONLY the final enhanced prompt in English — no explanations, no headings, no comments
- Keep the output concise but rich (2-4 sentences max)`;

/**
 * Quick single-string prompt enhancement.
 * @param userPrompt - The user's raw idea.
 * @returns An object containing the enhanced prompt string.
 */
export async function enhancePrompt(userPrompt: string): Promise<GroqResponse> {
    const content = await callGroq(SIMPLE_SYSTEM, userPrompt);
    return { enhancedPrompt: content };
}

// ═════════════════════════════════════════════════════════
//  2. Structured Enhance  (main generator with settings)
// ═════════════════════════════════════════════════════════

/**
 * Builds a dynamic system prompt based on the user's chosen
 * style, mood, aspect ratio, and detail level.
 */
function buildStructuredSystem(options: PromptOptions): string {
    const style = options.style || 'General';
    const mood = options.mood || 'Neutral';
    const ratio = options.aspectRatio || '1:1';
    const detail = options.complexity || 'detailed';

    let styleRules = '';

    if (style.toLowerCase().includes('anime')) {
        styleRules = `- The style is Anime. Use specific terms: "Niji style", "Studio Ghibli style", "cel-shaded", "vibrant anime aesthetics". Reference Japanese animation techniques.`;
    } else if (style.toLowerCase().includes('photorealistic') || style.toLowerCase().includes('photo')) {
        styleRules = `- The style is Photorealistic. Add camera parameters: "8k resolution", "raw photo", "f/2.8 aperture", "85mm lens", "shallow depth of field", "DSLR quality". Reference real-world photography techniques.`;
    } else if (style.toLowerCase().includes('cyberpunk')) {
        styleRules = `- The style is Cyberpunk. Use terms: "neon-lit", "dystopian cityscape", "holographic", "rain-soaked streets", "synthwave palette", "augmented reality overlays".`;
    } else if (style.toLowerCase().includes('oil painting')) {
        styleRules = `- The style is Oil Painting. Use terms: "impasto brushstrokes", "rich pigments", "canvas texture", "Renaissance chiaroscuro", "classical composition".`;
    } else {
        styleRules = `- Apply "${style}" visual style throughout the prompt, using terminology specific to that aesthetic.`;
    }

    const detailRule =
        detail === 'concise'
            ? 'keep the prompt short and focused (1-2 sentences)'
            : detail === 'balanced'
                ? 'moderate detail (2-3 sentences)'
                : 'provide rich, comprehensive detail (3-5 sentences)';

    return `You are a world-class Prompt Engineer specializing in Generative AI.
The user wants to generate content with these specific parameters:
- Style: ${style}
- Mood: ${mood}
- Aspect Ratio: ${ratio}
- Detail Level: ${detail}

Rules:
${styleRules}
- Set the mood to "${mood}" — incorporate atmosphere, lighting, and emotional tone that match this mood.
- Detail level is "${detail}": ${detailRule}.
- At the END of the optimized prompt, ALWAYS append the Midjourney aspect ratio parameter: --ar ${ratio}

Principles by target type:
- For IMAGE generation: Focus on subject, composition, lighting, art style, camera settings, texture, rendering quality.
- For VIDEO generation: Focus on motion, camera movement, pacing, scene transitions, atmosphere, frame rate.
- For TEXT generation: Focus on persona, context, constraints, tone, output format.

You MUST respond ONLY with valid JSON matching this exact schema:
{
  "title": "string — a creative short title",
  "optimizedPrompt": "string — the full enhanced prompt ending with --ar ${ratio}",
  "negativePrompt": "string or null — things to avoid",
  "explanation": "string — brief reasoning for your style and mood choices",
  "suggestedTags": ["string", "string", "string"]
}

No markdown, no code fences, no extra text — ONLY the JSON object.`;
}

/**
 * Generates a structured, production-ready prompt based on user settings.
 *
 * Takes into account `style`, `mood`, `aspectRatio`, `complexity`, and
 * `targetModel` to produce tailored prompts for image / video / text generation.
 *
 * @param options - Full set of user-selected generation parameters.
 * @returns A structured `EnhancedResult` with title, prompt, explanation, and tags.
 * @throws {Error} If the API call fails or the response cannot be parsed as JSON.
 */
export async function generateEnhancedPrompt(options: PromptOptions): Promise<EnhancedResult> {
    const targetLabels: Record<string, string> = {
        [TargetModelType.IMAGE]: 'a high-fidelity AI-generated image',
        [TargetModelType.VIDEO]: 'an AI-generated video',
        [TargetModelType.TEXT]: 'a text response from an LLM',
    };
    const targetLabel = targetLabels[options.targetModel] ?? 'AI-generated content';

    const userPrompt = `Create a professional prompt for ${targetLabel}.

User's idea: "${options.baseIdea}"

Generate the structured JSON response following the system rules strictly.`;

    const systemPrompt = buildStructuredSystem(options);
    const content = await callGroq(systemPrompt, userPrompt, 0.7, 1024);

    try {
        return JSON.parse(content) as EnhancedResult;
    } catch {
        throw new Error('Failed to parse structured response from AI. Please try again.');
    }
}

// ═════════════════════════════════════════════════════════
//  3. Image-to-Prompt  (Vision — reverse engineering)
// ═════════════════════════════════════════════════════════

const VISION_SYSTEM = `Analyze the image for AI Art Generation (Midjourney/Flux).
Identify:
1. Subject (Who/What?)
2. Medium (Photo, 3D Render, Oil Painting?)
3. Lighting & Mood (Volumetric, Neon, Dark?)
4. Camera/Technique (Bokeh, Wide Angle, Cel Shaded?)

Output ONLY a concise, comma-separated prompt tailored for generation.`;

/**
 * Sends an image to Groq Vision API and returns a technical,
 * comma-separated prompt that would recreate the image in Midjourney.
 *
 * @param base64Image - Base64-encoded image (with or without `data:` prefix).
 * @param userHint    - Optional user-provided context to refine the analysis.
 * @returns A comma-separated prompt string describing the image.
 * @throws {Error} If the API call fails or the response is empty.
 */
export async function describeImage(base64Image: string, userHint?: string): Promise<string> {
    const apiKey = getGroqApiKey();

    const imageUrl = base64Image.startsWith('data:')
        ? base64Image
        : `data:image/jpeg;base64,${base64Image}`;

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: 'image_url', image_url: { url: imageUrl } },
        {
            type: 'text',
            text: userHint?.trim()
                ? `Additional context from user: "${userHint}"`
                : 'Reverse-engineer this image into a Midjourney prompt.',
        },
    ];

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: GROQ_VISION_MODEL,
                messages: [
                    { role: 'system', content: VISION_SYSTEM },
                    { role: 'user', content: userContent },
                ],
                temperature: 0.5,
                max_tokens: 512,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const message = errorData?.error?.message ?? `Groq Vision API error: ${response.status}`;
            throw new Error(message);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
            throw new Error('Vision model returned an empty response. Try a different image.');
        }

        return content;
    } catch (error) {
        if (error instanceof Error) {
            // Graceful fallback for users without Llama 4 access
            if (error.message.includes('404') || error.message.includes('400') || error.message.includes('not exist') || error.message.includes('decommissioned')) {
                return 'Vision model unavailable via Free API. Please describe the image manually.';
            }
            throw error;
        }
        throw new Error('An unexpected error occurred while analyzing the image.');
    }
}
