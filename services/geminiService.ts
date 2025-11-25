import { GoogleGenAI, Modality, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Context for TTS
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    // Fix for webkitAudioContext type error on older browsers (e.g. Safari)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass({ sampleRate: 24000 });
  }
  return audioContext;
};

// Helper to decode base64 to Uint8Array
function decodeBase64(base64String: string): Uint8Array {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert PCM data to AudioBuffer
function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): AudioBuffer {
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

// Generate Pinyin for a list of characters
export const generatePinyinData = async (chars: string[]): Promise<{ char: string; pinyin: string }[]> => {
  if (chars.length === 0) return [];

  try {
    const prompt = `Convert the following Chinese characters to Pinyin with tone marks. Return a JSON array where each object has "char" and "pinyin" properties. 
    Characters: ${chars.join(', ')}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              char: { type: Type.STRING },
              pinyin: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return chars.map(c => ({ char: c, pinyin: '' }));
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating Pinyin:", error);
    return chars.map(c => ({ char: c, pinyin: '' }));
  }
};

// Generate Image for Characters (AI Role)
export const generateCharacterImage = async (theme: string, stylePrompt: string): Promise<string | null> => {
  try {
    // Mix in some randomness to get different characters
    const adjectives = ['happy', 'cute', 'dancing', 'jumping', 'waving', 'cool', 'heroic', 'playful'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const prompt = `A single high-quality 3D blind box toy figure design of a ${randomAdj} ${stylePrompt}. 
    White background, studio lighting, simple shape, vector-like 3d render, adorable, chibi style.
    Ensure the character is centered and the background is pure white.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        // Using 1:1 for square blind box usage
        imageConfig: {
          aspectRatio: "1:1", 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

// Text-to-Speech
export const playTTS = async (text: string) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
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
      const pcmData = decodeBase64(base64Audio);
      const audioBuffer = pcmToAudioBuffer(pcmData, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};