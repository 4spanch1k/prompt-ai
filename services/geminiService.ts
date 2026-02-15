import { GoogleGenAI, Type } from "@google/genai";
import { PromptOptions, EnhancedResult, TargetModelType } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
if (!apiKey) {
  console.warn("PromptCraft: VITE_GEMINI_API_KEY is not set in .env or .env.local. API calls will fail.");
}
const ai = new GoogleGenAI({ apiKey: apiKey ?? "" });

const MODEL_NAME = "gemini-3-flash-preview";

export const generateEnhancedPrompt = async (options: PromptOptions): Promise<EnhancedResult> => {
  const systemInstruction = `
    You are a world-class Prompt Engineer specializing in Generative AI. 
    Your goal is to take a user's basic idea and transform it into a highly effective, professional prompt for specific AI models.
    
    Principles:
    - For IMAGE generation (Midjourney, Stable Diffusion, DALL-E, Imagen): Focus on subject, composition, lighting, art style, camera settings, texture, and rendering engine details.
    - For VIDEO generation (Veo, Sora, Runway): Focus on motion, camera movement, pacing, scene transition, and atmosphere.
    - For TEXT generation (LLMs): Focus on persona, context, constraints, tone, and output format.
    
    Analyze the user's intent deeply. If the user asks for "a cat", and selects "Cyberpunk" style, do not just say "a cyberpunk cat". 
    Describe the neon lights reflecting off the fur, the futuristic cityscape in the background, the mechanical enhancements, etc.
  `;

  let promptContext = "";
  if (options.targetModel === TargetModelType.IMAGE) {
    promptContext = `Target: High-fidelity Image Generation. Style: ${options.style}. Mood: ${options.mood || 'Neutral'}. Aspect Ratio: ${options.aspectRatio || '1:1'}.`;
  } else if (options.targetModel === TargetModelType.VIDEO) {
    promptContext = `Target: Video Generation. Style: ${options.style}. Mood: ${options.mood || 'Cinematic'}.`;
  } else if (options.targetModel === TargetModelType.TEXT) {
    promptContext = `Target: Large Language Model (Text). Tone: ${options.style}. Complexity: ${options.complexity}.`;
  }

  const userPrompt = `
    User Idea: "${options.baseIdea}"
    Context: ${promptContext}
    Complexity Level: ${options.complexity}
    
    Please generate a structured response containing:
    1. A creative title for this prompt concept.
    2. The fully optimized, detailed prompt ready for copy-pasting.
    3. A negative prompt (things to avoid) if applicable (mostly for images/video), otherwise null.
    4. A brief explanation of why you added specific details.
    5. A list of 3-5 relevant tags or keywords.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            optimizedPrompt: { type: Type.STRING },
            negativePrompt: { type: Type.STRING, nullable: true },
            explanation: { type: Type.STRING },
            suggestedTags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "optimizedPrompt", "explanation", "suggestedTags"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as EnhancedResult;
    }
    throw new Error("No response text received from Gemini.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to enhance prompt. Please try again.");
  }
};
