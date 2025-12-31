
export type AccountType = 'business' | 'individual' | 'creator' | 'enterprise';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type UserRole = 'Owner' | 'Creator' | 'Analyst' | 'Admin' | 'Superuser';

export type ViewType = 
  'dashboard' | 'generate' | 'calendar' | 'audit' | 
  'viral' | 'consultant' | 'engagement' | 'accounts' | 
  'diagnostics' | 'reputation' | 'campaigns' | 'team' | 
  'campaign_detail' | 'admin_panel' | 'influencers' | 'knowledge' | 'billing';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AuthMetadata {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  scopes: string[];
  tokenType: string;
  stateNonce?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isLoggedIn: boolean;
  linkedAccounts: SocialAccount[];
  automationSettings?: AutomationSettings;
  workspaceMembers?: TeamMember[];
  usage: {
    aiGenerations: number;
    plan: SubscriptionPlan;
    billingHistory: BillingTransaction[];
  };
  authMethod: 'password' | 'passkey' | 'sso';
  sessions: any[];
  password?: string;
}

export interface BillingTransaction {
  id: string;
  date: string;
  plan: SubscriptionPlan;
  amount: string;
  status: 'confirmed' | 'pending';
  reference: string;
}

export interface KnowledgeFact {
  id: string;
  category: 'pricing' | 'logistics' | 'menu' | 'bio' | 'other';
  content: string;
  createdAt: string;
  lastVerifiedAt?: string; // COUNCIL HARDENING: Ensuring data freshness
}

export interface SocialAccount {
  platform: 'Instagram' | 'Facebook' | 'Twitter' | 'WhatsApp' | 'TikTok';
  handle: string;
  isConnected: boolean;
  tokenHealth: 'healthy' | 'expiring' | 'expired';
  authMetadata?: AuthMetadata;
}

export interface SocialProfile {
  profile_id: string;
  account_type: AccountType;
  name: string;
  focus_area: string;
  location: { city: string; state: string; country: string; };
  tone: string;
  main_objective: string;
  pricing_logic?: 'direct' | 'dm' | 'ask';
  automation_level?: 'suggest' | 'assist' | 'handle';
  growth_platforms?: string[];
  post_frequency?: 'daily' | 'thrice' | 'trending';
  target_audience?: string;
  forbidden_tones?: string[];
  delivery_details?: string;
  branding?: { colors: string[] };
}

export interface AnalyticsPoint { name: string; value: number; }
export interface ViralSpark { viral_concept: string; hook_options: any; reason_for_virality: string; }
export interface SmartReply { 
  professional: string; 
  relatable: string; 
  sales_closer: string;
  confidence_score: number; // COUNCIL HARDENING: Safety gate
}

export interface SentimentAnalysis { 
  tone: 'positive' | 'neutral' | 'negative' | 'urgent'; 
  summary: string; 
  suggestedAction: string; 
  reason?: string; 
  sources?: GroundingSource[]; 
}

export interface AuditResult { 
  handle: string; 
  platform: string; 
  health_score: number; 
  follower_count: string;
  found_bio: string;
  analysis: { opportunities: string[]; }; 
  ai_optimized_bio: string; 
  sources: GroundingSource[]; 
  engagement_status?: string;
}

export interface BenchmarkResult {
  user_handle: string;
  competitor_handle: string;
  comparison: {
    user_score: number;
    competitor_score: number;
    winner: string;
    detailed_diff: string;
  };
  strategy_to_beat: string;
  competitive_advantage: string[];
  missing_gaps: string[];
  sources: GroundingSource[];
}

export interface DailyPackage { 
  text_post: string; 
  caption_long: string; 
  image_brief: string; 
  performance_tips: string; 
  reasoning: string; 
  confidence_score: number;
  whatsapp_ready_broadcast: string; // COUNCIL HARDENING: Native formatting
}

export interface TeamMember { id: string; name: string; email: string; role: UserRole; status: 'active' | 'pending'; }
export interface Campaign { 
  id: string; 
  name: string; 
  objective: string; 
  status: 'active' | 'paused' | 'completed'; 
  createdAt: string; 
  postsCount: number;
  analytics?: { reach: number; conversions: number };
}
export interface ScheduledPost { id: string; date: string; platform: string; title: string; content: string; status: 'draft' | 'scheduled' | 'published'; }
export interface MediaAsset { id: string; type: 'image' | 'video' | 'audio'; data: string; prompt: string; createdAt: string; }
export interface Influencer { name: string; platform: string; handle: string; relevance_score: number; uri: string; niche: string; }
export interface AutomationSettings { 
  autoReplyDMs: boolean; 
  autoReplyComments: boolean; 
  preferredLanguage: string; 
  socialListeningKeywords: string[]; 
  safety_threshold: number; // COUNCIL HARDENING: Threshold for autonomy
}
export interface ActivityLog { id: string; user: string; action: string; timestamp: string; }
export interface EngagementSuggestion { target_post_desc: string; suggested_comment: string; psychological_angle: string; }
