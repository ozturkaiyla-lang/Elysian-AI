import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, RestorationBlueprint } from "../types";

export class GeminiService {
  private getAI() {
    // process.env.API_KEY is defined in vite.config.ts
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
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
    const ai = this.getAI();
    const model = mode === 'DEEP' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const sys = `You are Elysian, an elite AI emotional therapist. 
      Tone: Gentle, authoritative on psychology, deeply empathetic, but most importantly: ACTION-ORIENTED.
      Objective: Provide ADVICE and INTELLIGENT SUGGESTIONS on how to FIX the user's emotional or relationship state.
      Context: User name is ${profile?.name || 'User'}. Focus: ${profile?.mainFocus || 'Mental Well-being'}. ${profile?.context ? `Context: ${profile.context}` : ''}`;

    const contents = [
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model' as any,
        parts: [{ text: h.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const config: any = { systemInstruction: sys };
    if (mode === 'DEEP') {
      config.thinkingConfig = { thinkingBudget: 16000 };
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const thought = (response as any).candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.thought;
    
    return {
      text: response.text || "I'm reflecting deeply on that. Can you tell me more?",
      thinking: thought
    };
  }

  async generateBlueprint(
    history: { role: 'user' | 'assistant', content: string }[],
    profile?: UserProfile
  ): Promise<RestorationBlueprint> {
    const ai = this.getAI();
    const prompt = `Based on our therapeutic session, create a "Restoration Blueprint" JSON. 
      Focus on INTELLIGENT SUGGESTIONS to FIX the situation.
      Conversation Summary: ${history.map(h => h.content).slice(-10).join(' ')}
      User Profile: ${JSON.stringify(profile)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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

    const blueprint = JSON.parse(response.text || '{}');
    return { ...blueprint, lastUpdated: Date.now() };
  }

  async generateTTS(text: string): Promise<Uint8Array | null> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with deep empathy: ${text}` }] }],
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