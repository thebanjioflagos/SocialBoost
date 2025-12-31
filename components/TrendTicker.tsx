
import React, { useState, useEffect } from 'react';
import { getLiveTrendingTopics } from '../services/geminiService';
import { LucideTrendingUp, LucideGlobe, LucideLoader2 } from 'lucide-react';
import { SocialProfile } from '../types';

interface TrendTickerProps {
  profile: SocialProfile | null;
}

export const TrendTicker: React.FC<TrendTickerProps> = ({ profile }) => {
  const [trends, setTrends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await getLiveTrendingTopics(profile);
        setTrends(data);
      } catch (e) {
        setTrends(["Jollof Rice Trends", "Afrobeats Hits", "Lagos Tech Week", "Naira Value Updates"]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [profile]);

  return (
    <div className="w-full bg-slate-900 border-b border-white/5 py-3 overflow-hidden flex items-center gap-6">
      <div className="flex items-center gap-2 px-6 border-r border-white/10 shrink-0">
        <LucideTrendingUp size={16} className="text-brand-gold" />
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Pulse</span>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-2 animate-pulse text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          <LucideLoader2 size={12} className="animate-spin" /> Fetching real-time market signals...
        </div>
      ) : (
        <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
          {trends.concat(trends).map((trend, i) => (
            <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-1 bg-brand-gold rounded-full"></span> {trend.replace(/^\d\.\s*/, '')}
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};
