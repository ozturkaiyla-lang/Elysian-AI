import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, RestorationBlueprint } from "../types";

export class GeminiService {
  private getAI() {
    // Strictly using process.env.API_KEY as provided by Vercel environment
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: API_KEY is missing from environment variables.");
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
        Role: You don't just listen; you ANALYZE and FIX. 
        Tone: Empathetic but clinical, authoritative on psychology, and intensely focused on actionable recovery.
        Objective: For every problem the user shares, provide a "Fix Protocol." Use psychological frameworks (CBT, DBT, Gottman Method) to intelligently suggest how the user can change their situation.
        User Identity: ${profile?.name || 'Friend'}. 
        Current Focus Area: ${profile?.mainFocus || 'Emotional Well-being'}. 
        Additional User Context: ${profile?.context || 'First session.'}`;

      // Corrected: Contents must be an array of objects with role and parts
      const contents = [
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          thinkingConfig: mode === 'DEEP' ? { thinkingBudget: 32768 } : undefined
        },
      });

      return {
        text: response.text || "I'm reflecting on your situation. Could you tell me more?",
        thinking: (response as any).candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.thought
      };
    } catch (error) {
      console.error("Gemini API Connection Error:", error);
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
      const prompt = `Based on the following therapy session history, generate a "Restoration Blueprint" JSON object to FIX the user's emotional state or relationship. 
        Be specific, directive, and intelligently strategic.
        
        Session History:
        ${conversationText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rootAnalysis: { type: Type.STRING, description: "A deep dive into the hidden psychological cause of the user's pain." },
              coreShift: { type: Type.STRING, description: "The single most important mindset change required to fix this." },
              actionSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    whyItWorks: { type: Type.STRING, description: "The psychological logic behind this step." }
                  },
                  required: ['title', 'description', 'whyItWorks']
                }
              },
              suggestedRitual: { type: Type.STRING, description: "A daily habit to solidify the healing." }
            },
            required: ['rootAnalysis', 'coreShift', 'actionSteps', 'suggestedRitual']
          }
        }
      });

      const blueprint = JSON.parse(response.text || '{}');
      return { ...blueprint, lastUpdated: Date.now() };
    } catch (error) {
      console.error("Blueprint generation failed:", error);
      throw error;
    }
  }

  async generateTTS(text: string): Promise<Uint8Array | null> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ role: 'user', parts: [{ text: `Speak with clinical empathy and deep warmth: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });
      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return data ? this.decodeBase64(data) : null;
    } catch { return null; }
  }

  private decodeBase64(b64: string): Uint8Array {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
}

export const gemini = new GeminiService();