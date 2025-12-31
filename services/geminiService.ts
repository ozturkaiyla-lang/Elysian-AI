import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { UserProfile } from "../types";

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
      // Use the correct Gemini 3 model names as per guidelines
      const modelName = mode === 'DEEP' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const namePart = profile?.name ? `The user's name is ${profile.name}. ` : "";
      const focusPart = profile?.mainFocus ? `Their primary concern is: ${profile.mainFocus}. ` : "";
      const contextPart = profile?.context ? `Context: ${profile.context}. ` : "";

      const systemInstruction = `You are Elysian, a world-class AI emotional therapist. 
        Your tone is empathetic, professional, gentle, and deeply insightful. 
        ${namePart}${focusPart}${contextPart}
        You specialize in healing broken relationships, providing marriage counseling, and helping users find happiness in difficult life transitions.
        When providing advice, be actionable but non-judgmental. Always address the user warmly.`;

      const contents = [
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const config: any = {
        systemInstruction,
      };

      if (mode === 'DEEP') {
        config.thinkingConfig = { thinkingBudget: 32768 };
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI");
      }

      return {
        text: text,
        thinking: (response as any).candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.thought
      };
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error.message?.includes("API_KEY_MISSING") || error.message?.includes("403")) {
        throw new Error("KEY_RESET_REQUIRED");
      }
      throw error;
    }
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
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return this.decodeBase64(base64Audio);
      }
      return null;
    } catch (error) {
      console.error("TTS generation failed", error);
      return null;
    }
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async playAudio(data: Uint8Array) {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await this.decodeAudioData(data, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }

  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export const gemini = new GeminiService();