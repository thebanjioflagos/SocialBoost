
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { SocialProfile, DailyPackage, AuditResult, ViralSpark, BenchmarkResult, EngagementSuggestion, SmartReply, AnalyticsPoint, SentimentAnalysis, Influencer, KnowledgeFact, GroundingSource } from "../types";
import { getOrchestratedPrompt } from "./intelligenceConfig";
import { dataService } from "./dataService";

export class ApiKeyError extends Error {
  status?: number;
  isQuota?: boolean;
  constructor(message: string, status?: number, isQuota?: boolean) {
    super(message);
    this.name = 'ApiKeyError';
    this.status = status;
    this.isQuota = isQuota;
  }
}

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeGenerate = async (fn: (ai: any) => Promise<any>, retries = 3): Promise<any> => {
  try {
    const ai = getClient();
    return await fn(ai);
  } catch (error: any) {
    const message = error.message || "";
    const status = error.status || error.error?.code || 0;
    if (status === 429 || message.toLowerCase().includes("quota")) {
      throw new ApiKeyError("API Quota Exceeded. Switch to a Paid Project key.", 429, true);
    }
    if (retries > 0 && (status >= 500 || message.toLowerCase().includes("network"))) {
      await new Promise(res => setTimeout(res, (4 - retries) * 2000));
      return safeGenerate(fn, retries - 1);
    }
    throw new Error(message || "Intelligence Node Offline.");
  }
};

const extractSources = (response: any): GroundingSource[] => {
  return response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((c: any) => c.web)
    ?.map((c: any) => ({ title: c.web.title, uri: c.web.uri })) || [];
};

/**
 * PRODUCTION HARDENING: Mandatory confidence score and platform-specific outputs.
 */
export const generateDailyPackage = async (profile: SocialProfile, focusTopic?: string): Promise<DailyPackage> => {
  const facts = await dataService.getKnowledgeFacts();
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a high-performance content package for ${profile.name}.
      Current Facts: ${JSON.stringify(facts)}
      Platform: Instagram, Facebook, and WhatsApp.
      Strategy: Grounded in regional trends.`,
      config: { 
        systemInstruction: getOrchestratedPrompt(profile, facts), 
        responseMimeType: "application/json", 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text_post: { type: Type.STRING },
            caption_long: { type: Type.STRING },
            image_brief: { type: Type.STRING },
            performance_tips: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER },
            whatsapp_ready_broadcast: { 
              type: Type.STRING, 
              description: "Short, bulleted broadcast message with emojis for WhatsApp Status/Groups."
            }
          },
          required: ["text_post", "caption_long", "image_brief", "performance_tips", "reasoning", "confidence_score", "whatsapp_ready_broadcast"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateSmartReplies = async (profile: SocialProfile, comment: string): Promise<SmartReply> => {
  const facts = await dataService.getKnowledgeFacts();
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft replies for ${profile.name} to: "${comment}".`,
      config: { 
        systemInstruction: getOrchestratedPrompt(profile, facts),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { 
            professional: { type: Type.STRING }, 
            relatable: { type: Type.STRING }, 
            sales_closer: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER } 
          },
          required: ["professional", "relatable", "sales_closer", "confidence_score"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

/**
 * Standard Intelligence Functions (Hardened for Production)
 */
export const performSocialAudit = async (handle: string, platform: string, profile: SocialProfile | null): Promise<AuditResult> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze ${handle} on ${platform}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            handle: { type: Type.STRING },
            platform: { type: Type.STRING },
            health_score: { type: Type.NUMBER },
            follower_count: { type: Type.STRING },
            found_bio: { type: Type.STRING },
            analysis: { type: Type.OBJECT, properties: { opportunities: { type: Type.ARRAY, items: { type: Type.STRING } } } },
            ai_optimized_bio: { type: Type.STRING }
          }
        }
      }
    });
    const result = JSON.parse(response.text || '{}');
    return { ...result, sources: extractSources(response) };
  });
};

// Fix: Added performCompetitorBenchmark which was missing but used in AuditTool.tsx
export const performCompetitorBenchmark = async (handle: string, compHandle: string, platform: string, profile: SocialProfile | null): Promise<BenchmarkResult> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Benchmark ${handle} against ${compHandle} on ${platform}. Target Profile context: ${JSON.stringify(profile)}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            user_handle: { type: Type.STRING },
            competitor_handle: { type: Type.STRING },
            comparison: {
              type: Type.OBJECT,
              properties: {
                user_score: { type: Type.NUMBER },
                competitor_score: { type: Type.NUMBER },
                winner: { type: Type.STRING },
                detailed_diff: { type: Type.STRING }
              },
              required: ["user_score", "competitor_score", "winner", "detailed_diff"]
            },
            strategy_to_beat: { type: Type.STRING },
            competitive_advantage: { type: Type.ARRAY, items: { type: Type.STRING } },
            missing_gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["user_handle", "competitor_handle", "comparison", "strategy_to_beat", "competitive_advantage", "missing_gaps"]
        }
      }
    });
    const result = JSON.parse(response.text || '{}');
    return { ...result, sources: extractSources(response) };
  });
};

export const generateViralSparks = async (profile: SocialProfile): Promise<ViralSpark> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Find trends for ${profile.focus_area} in Nigeria.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            viral_concept: { type: Type.STRING },
            hook_options: { type: Type.OBJECT, properties: { relatable: { type: Type.STRING }, controversial: { type: Type.STRING }, community: { type: Type.STRING } } },
            reason_for_virality: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const performSocialListening = async (keywords: string[], profile: SocialProfile | null): Promise<SentimentAnalysis[]> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Monitor keywords: ${keywords.join(', ')} in Nigeria.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { tone: { type: Type.STRING }, summary: { type: Type.STRING }, suggestedAction: { type: Type.STRING }, reason: { type: Type.STRING } }
          }
        }
      }
    });
    const sources = extractSources(response);
    return JSON.parse(response.text || '[]').map((r: any) => ({ ...r, sources }));
  });
};

export const generateHighQualityImage = async (prompt: string, profile: SocialProfile | null): Promise<string> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `Professional commercial photography for ${profile?.name}: ${prompt}` }] },
      config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } },
    });
    const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
    if (part) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("Forge Failed.");
  });
};

export const generateVeoVideo = async (prompt: string, profile: SocialProfile | null, startImageBase64?: string): Promise<string> => {
  return safeGenerate(async (ai) => {
    const operationParams: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic social media ad: ${prompt}`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    };
    if (startImageBase64) operationParams.image = { imageBytes: startImageBase64.split(',')[1], mimeType: 'image/png' };
    let operation = await ai.models.generateVideos(operationParams);
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  });
};

export const analyzeSentiment = async (comment: string, profile: SocialProfile | null): Promise<SentimentAnalysis> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze sentiment: "${comment}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { tone: { type: Type.STRING }, summary: { type: Type.STRING }, suggestedAction: { type: Type.STRING } }
        }
      }
    });
    return JSON.parse(response.text || '{"tone": "neutral"}');
  });
};

export const getMarketTrends = async (profile: SocialProfile): Promise<{title: string, detail: string}[]> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `3 marketing trends for ${profile.focus_area} in Nigeria.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return (response.text || "").split('\n').filter(l => l.length > 5).slice(0, 3).map(line => ({ title: "Trend", detail: line }));
  });
};

export const generateAnalyticsData = async (profile: SocialProfile): Promise<AnalyticsPoint[]> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Predict performance for ${profile.name}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } } }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const getLocalIntelligence = async (profile: SocialProfile): Promise<{name: string, uri: string, snippet: string}[]> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Business ops in ${profile.location.city}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, uri: { type: Type.STRING }, snippet: { type: Type.STRING } } }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const generateAutomatedReply = async (profile: SocialProfile, message: string, context: string): Promise<string> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Reply to ${context}: "${message}"`,
      config: { systemInstruction: getOrchestratedPrompt(profile) }
    });
    return response.text || "Thanks!";
  });
};

export const getLiveTrendingTopics = async (profile: SocialProfile | null): Promise<string[]> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Trending in Nigeria.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return (response.text || "").split('\n').slice(0, 5);
  });
};

export const discoverInfluencers = async (profile: SocialProfile): Promise<Influencer[]> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Influencers in ${profile.location.city} for ${profile.focus_area}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, platform: { type: Type.STRING }, handle: { type: Type.STRING }, relevance_score: { type: Type.NUMBER }, uri: { type: Type.STRING }, niche: { type: Type.STRING } } }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const getEngagementSuggestions = async (profile: SocialProfile): Promise<EngagementSuggestion[]> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Engagement strategy for ${profile.name}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.OBJECT, properties: { target_post_desc: { type: Type.STRING }, suggested_comment: { type: Type.STRING }, psychological_angle: { type: Type.STRING } } }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const generateVoiceOver = async (text: string, profile: SocialProfile | null): Promise<string> => {
  return safeGenerate(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Branded voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return `data:audio/pcm;base64,${data}`;
  });
};

export const decode = (b64: string) => {
  const s = atob(b64);
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
};

export const encode = (bytes: Uint8Array) => {
  let b = '';
  for (let i = 0; i < bytes.byteLength; i++) b += String.fromCharCode(bytes[i]);
  return btoa(b);
};

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const d = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = d.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let c = 0; c < numChannels; c++) {
    const cd = buffer.getChannelData(c);
    for (let i = 0; i < frameCount; i++) cd[i] = d[i * numChannels + c] / 32768.0;
  }
  return buffer;
}
