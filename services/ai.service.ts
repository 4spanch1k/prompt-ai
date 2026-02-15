const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-70b-8192';

const SYSTEM_PROMPT = `You are an expert prompt engineer specializing in Midjourney and AI image generation.
Your task is to take a user's short, simple idea and expand it into a highly detailed, professional prompt.

Rules:
- Add specific details about lighting (e.g., golden hour, cinematic lighting, soft ambient light)
- Include artistic style references (e.g., hyperrealistic, oil painting, cyberpunk aesthetic, Studio Ghibli)
- Specify camera settings when appropriate (e.g., 85mm lens, shallow depth of field, bird's eye view)
- Add artistic techniques (e.g., volumetric fog, chromatic aberration, double exposure)
- Include mood and atmosphere descriptors
- Output ONLY the final enhanced prompt in English — no explanations, no headings, no comments
- Keep the output concise but rich (2-4 sentences max)`;

export interface GroqResponse {
    enhancedPrompt: string;
}

export async function enhancePrompt(userPrompt: string): Promise<GroqResponse> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('GROQ API key is not configured. Add VITE_GROQ_API_KEY to your .env.local file.');
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 512,
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

    return { enhancedPrompt: content };
}
