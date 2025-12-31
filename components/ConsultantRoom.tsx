
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { SocialProfile } from '../types';
import { LucideMic, LucideMicOff, LucideLoader2, LucideSparkles, LucideInfo, LucideHistory, LucideAlertCircle, LucideRefreshCw, LucideKey, LucideShieldAlert } from 'lucide-react';
import { decode, decodeAudioData, encode } from '../services/geminiService';
// Fix: Import getOrchestratedPrompt instead of missing MASTER_INTELLIGENCE_PROMPT
import { getOrchestratedPrompt } from '../services/intelligenceConfig';

interface ConsultantRoomProps {
  profile: SocialProfile;
}

export const ConsultantRoom: React.FC<ConsultantRoomProps> = ({ profile }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<{message: string, isAuth?: boolean, is404?: boolean} | null>(null);
  const [transcriptions, setTranscriptions] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const handleOpenKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setError(null);
      startSession();
    }
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              // CRITICAL: Solely rely on sessionPromise resolves and then call session.sendRealtimeInput
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const buffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContext.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => [...prev, { role: 'ai', text }]);
            }
          },
          onclose: () => {
            setIsActive(false);
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
          },
          onerror: (e: any) => {
            console.error("Live Audio Error:", e);
            setError({ message: "Engine Error. Paid Key required for low-latency strategy sessions.", isAuth: true });
            setIsConnecting(false);
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          // Fix: Use getOrchestratedPrompt(profile) instead of MASTER_INTELLIGENCE_PROMPT
          systemInstruction: getOrchestratedPrompt(profile) + `\nClient: ${profile.name}. Goal: ${profile.main_objective}. Location: ${profile.location.city}.`,
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError({ message: "Hardware Connection Failed. Check Mic." });
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Strategy Room</h1>
        <p className="text-slate-500 font-medium italic">Talk directly to your Autonomous African Marketing Intelligence Agent.</p>
      </header>

      {error?.isAuth && (
        <div className="bg-brand-50 border-2 border-brand-200 p-8 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-xl">
          <LucideKey size={40} className="text-brand-500" />
          <div className="flex-1 space-y-1">
              <h3 className="text-xl font-black text-brand-900 uppercase">Enterprise Auth Required</h3>
              <p className="text-brand-700 font-bold text-sm">Low-latency voice consultation requires a Paid Project key.</p>
          </div>
          <button onClick={handleOpenKey} className="bg-brand-500 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl flex items-center gap-3">
             <LucideRefreshCw size={20} /> RE-SELECT KEY
          </button>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center space-y-12">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-700 ${isActive ? 'bg-brand-500 border-white shadow-[0_0_60px_rgba(34,197,94,0.5)]' : 'bg-slate-800 border-slate-700'}`}>
          {isActive ? <LucideMic size={48} className="animate-pulse" /> : <LucideMicOff size={48} className="text-slate-500" />}
        </div>
        <button 
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`px-12 py-5 rounded-2xl font-black text-lg shadow-2xl ${isActive ? 'bg-red-500' : 'bg-brand-500'}`}
        >
          {isConnecting ? <LucideLoader2 className="animate-spin" /> : isActive ? 'END SESSION' : 'START STRATEGY CALL'}
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-start gap-4">
          <LucideInfo className="text-brand-500" size={24} />
          <div>
             <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Consultant Profile</h4>
             <p className="text-xs text-slate-500 mt-2 italic leading-relaxed">"SocialBoost Pro acts as your regional executive. Ask about content pillars, local slang usage, or how to de-escalate customer complaints effectively."</p>
          </div>
      </div>
    </div>
  );
};
