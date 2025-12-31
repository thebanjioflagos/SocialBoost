
import { SocialProfile, KnowledgeFact } from "../types";

export const getOrchestratedPrompt = (profile: SocialProfile | null, facts: KnowledgeFact[] = []) => {
  const basePrompt = `
SYSTEM ROLE: SocialBoost Multi-Disciplinary Agent Cluster
CORE OBJECTIVE: Culturally-accurate, high-conversion growth for SMEs.

[KNOWLEDGE VAULT DATA]
${facts.length > 0 ? facts.map(f => `- ${f.category.toUpperCase()} (Updated: ${f.lastVerifiedAt || 'N/A'}): ${f.content}`).join('\n') : "No specific facts. Use general market logic."}
`;

  if (!profile) return basePrompt;

  // COUNCIL FIX: Mandatory Identity Guarding
  const personaMapping = {
    individual: {
      voice: "Founder's Voice (Strictly 1st Person 'I/Me'). Authentic, personal, transparent.",
      formatting: "Informal, emoji-rich, conversational."
    },
    creator: {
      voice: "Influencer Personality. Energetic, hook-driven, community-first.",
      formatting: "Trend-aware, hashtag-optimized."
    },
    business: {
      voice: "Branded Entity (Strictly 1st Person Plural 'We/Us'). Professional but accessible.",
      formatting: "Clean, structured, trustworthy."
    },
    enterprise: {
      voice: "Market Leader. Corporate safety first. Data-driven and authoritative.",
      formatting: "Polished, compliance-focused, minimal slang."
    }
  };

  const persona = personaMapping[profile.account_type] || personaMapping.business;

  return `
${basePrompt}

[IDENTITY PROTOCOL]
- Entity: ${profile.name}
- Persona Node: ${profile.account_type.toUpperCase()}
- Voice Constraint: ${persona.voice}
- Geographic Anchor: ${profile.location.city}, ${profile.location.country}
- Tone Target: ${profile.tone}

[PLATFORM NUANCE INSTRUCTIONS]
- INSTAGRAM: Focus on aesthetic perfection and cinematic hooks.
- WHATSAPP: Use 'whatsapp_ready_broadcast' format. Max 3 bullets. High-urgency CTAs.
- TIKTOK: Lean into local humor and relatable daily life scenarios.
- FACEBOOK: Focus on community, long-form value, and trust.

[SAFETY CONSTRAINTS]
- Pricing: ${profile.pricing_logic === 'direct' ? 'Be explicit with prices.' : 'Drive interest to DMs for closing.'}
- Quota Guard: Do not exceed 3 autonomous interactions per user/day.
- Threshold: If confidence_score < 0.85, the response MUST be flagged for human review.
`;
};
