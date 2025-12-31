
import React, { useState, useEffect } from 'react';
import { SocialProfile, ScheduledPost } from '../types';
import { dataService } from '../services/dataService';
import { LucideClock, LucideInstagram, LucideFacebook, LucideLoader2, LucideCalendarDays } from 'lucide-react';

interface CalendarViewProps {
  profile: SocialProfile;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ profile }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await dataService.getPosts();
        setPosts(result);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchPosts();
  }, []);

  // Simple day grouping for visualization
  const getPostForDay = (day: number) => {
    // This is a simplified mock for display, in real usage we'd use actual dates
    return posts.find(p => new Date(p.date).getDate() === day);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          Content Calendar <LucideCalendarDays className="text-brand-600" />
        </h1>
        <div className="flex gap-2">
           <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest">November 2025</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><LucideLoader2 className="animate-spin text-brand-600" /></div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {days.map(d => (
              <div key={d} className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[600px] bg-white divide-x divide-y divide-slate-100">
             {Array.from({length: 31}).map((_, i) => {
               const day = i + 1;
               const post = getPostForDay(day);
               return (
                 <div key={i} className="min-h-[120px] p-3 hover:bg-slate-50 transition-all group border-b border-r">
                   <span className={`text-xs font-black ${post ? 'text-brand-600' : 'text-slate-300'}`}>{day}</span>
                   {post && (
                     <div className="mt-3 bg-brand-50 border border-brand-200 p-3 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all">
                       <div className="flex items-center gap-2 mb-2">
                         <LucideInstagram size={12} className="text-pink-600" />
                         <LucideFacebook size={12} className="text-blue-600" />
                       </div>
                       <p className="text-[10px] text-brand-900 font-black leading-tight line-clamp-2 uppercase">
                         {post.title}
                       </p>
                       <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                          <LucideClock size={10} /> {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                     </div>
                   )}
                 </div>
               )
             })}
          </div>
        </div>
      )}
    </div>
  );
};
