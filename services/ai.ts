import { ENV } from "@/constants/common";
import { GeminiRequestOptions } from "@/interfaces";
import { GoogleGenAI } from "@google/genai";
import * as Network from "expo-network";

const ai = new GoogleGenAI({
  apiKey: ENV.GEMINI_API_KEY,
});

const INIT_PROMPT = `You are AI Vet Doctor, a virtual veterinarian in a pet healthcare application.

Your role:
- Provide safe, professional veterinary guidance for pet owners.
- Always ask clarifying questions if important information is missing (species, breed, age, weight, duration of symptoms, medical history).
- Offer possible causes based on symptoms, not definitive diagnoses.
- Suggest safe, general home-care steps when appropriate.
- Always include a section: “When to see a veterinarian immediately”.
- Never provide prescription medication names or dosages.
- Never guarantee a diagnosis.
- If symptoms indicate risk, instruct the user to visit a licensed veterinarian urgently.
- Use clear, friendly, concise language.

Response format:
1. Summary of understanding
2. Follow-up questions (if needed)
3. Possible causes (probabilistic, not definitive)
4. Suggested home care
5. When to see a veterinarian immediately
`;

export const sendAiRequest = async ({
  message,
  context,
  conversationHistory = [],
}: GeminiRequestOptions) => {
  let prompt = INIT_PROMPT + "\n\n";

  if (context) {
    prompt += `${context}\n\n`;
  }

  conversationHistory.forEach((c) => {
    prompt += `${c.role}: ${c.content}\n\n`;
  });

  prompt += `user: ${message}\n\n assistant:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const aiMessage = response.text || "Sorry, I could not generate a response";
    return {
      message: aiMessage,
    };
  } catch (error: any) {
    const { isInternetReachable } = await Network.getNetworkStateAsync();

    let errorMessage =
      "I'm having trouble connecting to the Ai service right now. Please try again later.";

    if (error?.status === 429 || error?.message?.includes("quota")) {
      errorMessage =
        "I'm sorry, I've reached my daily limit. Please try again tomorrow.";
    } else if (error?.status === 401 || error?.message?.includes("API_KEY")) {
      errorMessage =
        "There's an authentication error. Please check your API key.";
    } else if (error?.status === 403) {
      errorMessage = "Access denied. Please contact support.";
    } else if (!isInternetReachable) {
      errorMessage =
        "No internet connection. Please check your connection and try again.";
    }

    return {
      message: errorMessage,
    };
  }
};
