import { GoogleGenAI, Modality, Type } from "@google/genai";
import { UserProfile, RestorationBlueprint } from "../types";

export class GeminiService {
  private getAI() {
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
    try {
      const ai = this.getAI();
      const modelName = mode === 'DEEP' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const systemInstruction = `You are Elysian, an elite AI emotional therapist. 
        Tone: Gentle, authoritative on psychology, deeply empathetic, but most importantly: ACTION-ORIENTED.
        Objective: Provide ADVICE and INTELLIGENT SUGGESTIONS on how to FIX the user's emotional or relationship state.
        User Identity: ${profile?.name || 'Friend'}. 
        Current Focus: ${profile?.mainFocus || 'Emotional Well-being'}. 
        Additional Context: ${profile?.context || 'No specific history shared yet.'}`;

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
          thinkingConfig: mode === 'DEEP' ? { thinkingBudget: 16000 } : undefined
        },
      });

      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      const thought = (response as any).candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.thought;
      
      return {
        text: response.text,
        thinking: thought
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async generateBlueprint(
    history: { role: 'user' | 'assistant', content: string }[],
    profile?: UserProfile
  ): Promise<RestorationBlueprint> {
    try {
      const ai = this.getAI();
      const prompt = `Review this conversation and create a structured "Restoration Blueprint" to FIX the user's situation. 
        Output MUST be strictly JSON.
        History: ${history.map(h => h.content).join(' | ')}`;

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
        contents: [{ parts: [{ text: `Say with deep warmth and empathy: ${text}` }] }],
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

  async playAudio(data: Uint8Array) {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const dataInt16 = new Int16Array(data.buffer);
      const frameCount = dataInt16.length;
      const buffer = ctx.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Playback error:", e);
    }
  }
}

export const gemini = new GeminiService();