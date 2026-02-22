import { PromptOptions, GenerationResult, PromptVariant, TargetModelType } from '../types';

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
 * Shared format instruction appended to all system prompts.
 * Requires the LLM to output valid JSON with 3 named variants.
 */
const VARIATIONS_FORMAT_INSTRUCTION = `
CRITICAL: Generate 3 DISTINCT prompt variations. Output MUST be valid JSON (no markdown, no code fences, no extra text).

Structure:
{
  "balanced": { "positive": "...", "negative": "..." },
  "creative": { "positive": "...", "negative": "..." },
  "artistic": { "positive": "...", "negative": "..." }
}

- "balanced": Follows the user's instructions precisely and faithfully.
- "creative": Adds unique details, unexpected angles, dramatic lighting, and inventive composition.
- "artistic": Focuses heavily on style, mood, and aesthetics — cinematic color grading, painterly textures, emotional atmosphere.

Each variant MUST have both "positive" and "negative" strings. Output ONLY the raw JSON object, nothing else.`;

/**
 * Builds a dynamic system prompt based on the user's chosen
 * style, mood, aspect ratio, detail level, target AI model, and mode.
 */
function buildStructuredSystem(options: PromptOptions): string {
    const mood = options.mood || 'Neutral';
    const ratio = options.aspectRatio || '1:1';
    const detail = options.complexity || 'detailed';
    const mode = options.mode || 'image';

    const detailRule =
        detail === 'concise'
            ? 'keep the prompt short and focused (1-2 sentences)'
            : detail === 'balanced'
                ? 'moderate detail (2-3 sentences)'
                : 'provide rich, comprehensive detail (3-5 sentences)';

    // ════════════════════════════════
    //  VIDEO MODE
    // ════════════════════════════════
    if (mode === 'video') {
        const camera = options.camera || 'Static';
        const aiModel = options.aiModel || 'Runway Gen-3';

        let cameraRules = '';
        switch (camera) {
            case 'Static': cameraRules = 'Camera is locked/static — no movement, stable tripod shot.'; break;
            case 'Zoom In': cameraRules = 'Slow zoom in toward the subject, building dramatic tension.'; break;
            case 'Zoom Out': cameraRules = 'Slow zoom out revealing the full scene and environment.'; break;
            case 'Pan Left': cameraRules = 'Smooth horizontal pan from right to left across the scene.'; break;
            case 'Pan Right': cameraRules = 'Smooth horizontal pan from left to right across the scene.'; break;
            case 'Truck Left': cameraRules = 'Camera physically moves left on a dolly/track, keeping subject in frame — lateral tracking shot.'; break;
            case 'Truck Right': cameraRules = 'Camera physically moves right on a dolly/track, keeping subject in frame — lateral tracking shot.'; break;
            case 'Tilt Up': cameraRules = 'Vertical tilt from ground level upward toward the sky.'; break;
            case 'Tilt Down': cameraRules = 'Vertical tilt from sky downward to ground level.'; break;
            case 'Orbit': cameraRules = 'Camera orbits 360° around the subject, revealing all angles — cinematic arc shot.'; break;
            case 'Handheld': cameraRules = 'Handheld camera with natural micro-shake — raw, immersive, documentary feel.'; break;
            default: cameraRules = `Camera movement: ${camera}.`; break;
        }

        return `You are a world-class Video Prompt Engineer specializing in AI video generation (${aiModel}).
The user wants to generate a video clip with these parameters:
- Target AI: ${aiModel}
- Camera Movement: ${camera}
- Mood: ${mood}
- Detail Level: ${detail}

Rules:
- Use CINEMATOGRAPHY terminology: describe shots, movement, pacing, lighting.
- Structure: [Subject + Action] + [Camera Movement] + [Lighting/Mood] + [Speed/Physics]
- Camera instruction: ${cameraRules}
- Set the mood to "${mood}" — incorporate atmosphere, lighting, and emotional tone.
- Detail level is "${detail}": ${detailRule}.
- Describe motion, physics, and temporal flow (slow-motion, time-lapse, real-time).
- Do NOT use image-only parameters like --ar, --v, --niji.

${VARIATIONS_FORMAT_INSTRUCTION}
Negative prompts for video should include: static image, freeze frame, blurry, jittery, low fps, watermark, text overlay, distortion, morphing artifacts.`;
    }

    // ════════════════════════════════
    //  IMAGE MODE (existing logic)
    // ════════════════════════════════
    const style = options.style || 'General';
    const aiModel = options.aiModel || 'Midjourney';

    let styleRules = '';

    if (style.toLowerCase().includes('anime')) {
        styleRules = `- The style is Anime. Use specific terms: "Niji style", "Studio Ghibli style", "cel-shaded", "vibrant anime aesthetics". Reference Japanese animation techniques.`;
    } else if (style.toLowerCase().includes('photorealistic') || style.toLowerCase().includes('photo')) {
        styleRules = `- The style is Photorealistic. Add camera parameters: "8k resolution", "raw photo", "f/2.8 aperture", "85mm lens", "shallow depth of field", "DSLR quality".`;
    } else if (style.toLowerCase().includes('cyberpunk')) {
        styleRules = `- The style is Cyberpunk. Use terms: "neon-lit", "dystopian cityscape", "holographic", "rain-soaked streets", "synthwave palette", "augmented reality overlays".`;
    } else if (style.toLowerCase().includes('oil painting')) {
        styleRules = `- The style is Oil Painting. Use terms: "impasto brushstrokes", "rich pigments", "canvas texture", "Renaissance chiaroscuro", "classical composition".`;
    } else {
        styleRules = `- Apply "${style}" visual style throughout the prompt, using terminology specific to that aesthetic.`;
    }

    // ── Image model-specific instructions ──
    let modelRules = '';
    let formatInstructions = '';

    switch (aiModel) {
        case 'Midjourney':
            modelRules = `
TARGET: Midjourney v6
- Style: Artistic, concise, evocative.
- At the END of the positive prompt, ALWAYS append: --ar ${ratio}
- Also append: ${style.toLowerCase().includes('anime') ? '--niji 6' : '--v 6.0'}
- Use comma-separated descriptors. Midjourney prefers short, punchy phrases over long sentences.`;
            formatInstructions = `The Positive Prompt must end with --ar ${ratio} ${style.toLowerCase().includes('anime') ? '--niji 6' : '--v 6.0'}`;
            break;

        case 'DALL-E 3':
            modelRules = `
TARGET: DALL-E 3 (OpenAI)
- Style: Descriptive, natural language. Write as a coherent paragraph.
- DO NOT use any technical parameters like --ar, --v, --niji. These are NOT supported.
- Instead of --ar, describe the aspect ratio in words: "${ratio === '16:9' ? 'Wide landscape format' : ratio === '9:16' ? 'Tall portrait format' : ratio === '4:3' ? 'Classic 4:3 format' : ratio === '21:9' ? 'Ultra-wide cinematic format' : 'Square format'}".
- Write ONE flowing descriptive paragraph. DALL-E 3 excels with natural language descriptions.
- Avoid tag-based syntax. Use full sentences.`;
            formatInstructions = `The Positive Prompt must be a natural language paragraph with NO technical parameters (no --, no :: syntax).`;
            break;

        case 'Stable Diffusion':
            modelRules = `
TARGET: Stable Diffusion XL / Pony
- Style: Tag-based "tag soup" — comma-separated keywords and phrases.
- Start with quality tags: (best quality:1.2), (masterpiece:1.2), (highly detailed:1.1)
- Use weighted emphasis syntax: (important concept:1.3), [less important:0.8]
- Include technical tags: 8k uhd, sharp focus, intricate details
- Negative Prompt is CRITICAL for Stable Diffusion — always include comprehensive negative tags.
- Do NOT use --ar or Midjourney-specific parameters.
- Express aspect ratio as metadata only if relevant.`;
            formatInstructions = `The Positive Prompt must use comma-separated tags with weights like (concept:1.2). No --ar or Midjourney syntax.`;
            break;

        case 'Flux.1':
            modelRules = `
TARGET: Flux.1
- Style: Dry, factual, extremely detailed. No poetic language.
- Focus heavily on textures, materials, lighting conditions, and rendering quality.
- Be precise about surfaces (matte, glossy, weathered, translucent).
- Describe light sources explicitly (directional, ambient, rim lighting, caustics).
- No --ar or Midjourney-specific parameters.
- Write a detailed but clinical description. Flux responds best to precise, literal descriptions.`;
            formatInstructions = `The Positive Prompt must be technically precise and factual with NO poetic embellishment and NO -- parameters.`;
            break;
    }

    return `You are a world-class Prompt Engineer specializing in ${aiModel}.
The user wants to generate content with these specific parameters:
- Target AI Model: ${aiModel}
- Style: ${style}
- Mood: ${mood}
- Aspect Ratio: ${ratio}
- Detail Level: ${detail}

Rules:
${styleRules}
${modelRules}
- Set the mood to "${mood}" — incorporate atmosphere, lighting, and emotional tone that match this mood.
- Detail level is "${detail}": ${detailRule}.
${formatInstructions}

${VARIATIONS_FORMAT_INSTRUCTION}
Negative prompts should include standard defects: blur, watermark, bad anatomy, ugly, low quality, deformed, extra limbs, disfigured, text, logo — plus any request-specific exclusions.`;
}

/** Default negative prompt used as fallback */
const DEFAULT_NEGATIVE = 'blur, watermark, bad anatomy, ugly, low quality, deformed, extra limbs, disfigured, text, logo, cropped';

/**
 * Strips markdown code fences (```json ... ```) from LLM output.
 * @param raw - Raw LLM response that may be wrapped in markdown.
 * @returns Clean string ready for JSON.parse.
 */
function stripMarkdownFences(raw: string): string {
    return raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
}

/**
 * Safely parses the LLM's JSON response into a GenerationResult.
 * Falls back to a single-variant duplicate if parsing fails.
 *
 * @param raw - Raw string from the LLM.
 * @returns Validated GenerationResult with all 3 variants.
 */
function parseVariationsJSON(raw: string): GenerationResult {
    const cleaned = stripMarkdownFences(raw);

    try {
        const parsed = JSON.parse(cleaned);

        /** Validate and extract a single variant with fallback */
        const extractVariant = (key: string): PromptVariant => {
            const v = parsed[key];
            if (v && typeof v.positive === 'string' && typeof v.negative === 'string') {
                return { positive: v.positive.trim(), negative: v.negative.trim() };
            }
            return { positive: '', negative: DEFAULT_NEGATIVE };
        };

        const result: GenerationResult = {
            balanced: extractVariant('balanced'),
            creative: extractVariant('creative'),
            artistic: extractVariant('artistic'),
        };

        // If balanced is empty, something went wrong — throw to fallback
        if (!result.balanced.positive) {
            throw new Error('Empty balanced variant');
        }

        return result;
    } catch (err) {
        console.warn('[ai.service] JSON parse failed, using fallback:', err);

        // Fallback: treat entire response as a single prompt
        const fallbackPositive = cleaned.replace(/[{}"]/g, '').trim() || 'Generation failed — please try again.';
        const fallback: PromptVariant = { positive: fallbackPositive, negative: DEFAULT_NEGATIVE };
        return { balanced: fallback, creative: fallback, artistic: fallback };
    }
}

/**
 * Generates 3 distinct prompt variations (balanced, creative, artistic)
 * based on the user's settings.
 *
 * @param options - Full set of user-selected generation parameters.
 * @returns A `GenerationResult` with 3 named prompt variants.
 * @throws {Error} If the Groq API call fails entirely.
 */
export async function generateEnhancedPrompt(options: PromptOptions): Promise<GenerationResult> {
    const targetLabels: Record<string, string> = {
        [TargetModelType.IMAGE]: 'a high-fidelity AI-generated image',
        [TargetModelType.VIDEO]: 'an AI-generated video',
        [TargetModelType.TEXT]: 'a text response from an LLM',
    };
    const targetLabel = targetLabels[options.targetModel] ?? 'AI-generated content';

    const userPrompt = `Create 3 professional prompt variations for ${targetLabel}.

User's idea: "${options.baseIdea}"

Output ONLY valid JSON with keys: balanced, creative, artistic. Each with positive and negative strings. No markdown.`;

    const systemPrompt = buildStructuredSystem(options);
    const content = await callGroq(systemPrompt, userPrompt, 0.7, 2048);

    return parseVariationsJSON(content);
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
