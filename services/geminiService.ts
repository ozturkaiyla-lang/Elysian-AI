import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, RestorationBlueprint } from "../types";

export class GeminiService {
  private getAI() {
    let apiKey = process.env.API_KEY?.trim();
    
    // Support keys that were pasted with the "API" label prefix
    if (apiKey?.startsWith('APIAIzaSy')) {
      apiKey = apiKey.substring(3);
    }

    if (!apiKey) {
      console.error("GeminiService: API_KEY is missing from environment variables.");
      throw new Error("API_KEY_MISSING");
    }
    
    return new GoogleGenAI({ apiKey });
  }

  async getChatResponse(
    message: string, 
    history: { role: 'user' | 'assistant', content: string }[],
    mode: 'FAST' | 'DEEP',
    profile?: UserProfile
  ): Promise<{ text: string; thinking?: string }> {
    try {
      const ai = this.getAI();
      const modelName = mode === 'DEEP' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const systemInstruction = `You are Elysian, an elite AI emotional therapist and strategist. 
        Role: You are a "fixer." You don't just validate feelings; you analyze psychological bottlenecks and provide concrete "Fix Protocols."
        Frameworks: Use CBT, DBT, and high-level reasoning to suggest intelligent changes to the user's situation.
        Identity: Address the user as ${profile?.name || 'Friend'}. 
        Focus: ${profile?.mainFocus || 'General well-being'}. 
        Context: ${profile?.context || 'No additional context.'}`;

      const contents = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));
      
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          thinkingConfig: mode === 'DEEP' ? { thinkingBudget: 32768 } : undefined,
          temperature: 0.7,
        },
      });

      const text = response.text || "I'm listening and reflecting. Tell me more.";
      const thinking = (response as any).candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.thought;

      return { text, thinking };
    } catch (error: any) {
      console.error("Gemini Connection Error:", error);
      throw error;
    }
  }

  async generateBlueprint(
    history: { role: 'user' | 'assistant', content: string }[],
    profile?: UserProfile
  ): Promise<RestorationBlueprint> {
    try {
      const ai = this.getAI();
      const conversationText = history.map(h => `${h.role}: ${h.content}`).join('\n');
      const prompt = `Synthesize a "Restoration Blueprint" JSON for the user based on our therapy session:
        ${conversationText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rootAnalysis: { type: Type.STRING },
              coreShift: { type: Type.STRING },
              actionSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    whyItWorks: { type: Type.STRING }
                  },
                  required: ['title', 'description', 'whyItWorks']
                }
              },
              suggestedRitual: { type: Type.STRING }
            },
            required: ['rootAnalysis', 'coreShift', 'actionSteps', 'suggestedRitual']
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Blueprint synthesis failed:", error);
      throw error;
    }
  }

  async generateTTS(text: string): Promise<Uint8Array | null> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ role: 'user', parts: [{ text: `Deep clinical warmth: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });
      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) return null;
      
      const bin = atob(data);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } catch { return null; }
  }
}

export const gemini = new GeminiService();