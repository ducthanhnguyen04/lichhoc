'use client';

import { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import VoiceAssistantModal from './VoiceAssistantModal';

export default function VoiceAssistantFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 transition-all duration-300 sky-bounce group"
          aria-label="Hỏi Lịch Học bằng AI Voice"
        >
          {/* Glowing background ring */}
          <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 blur-sm opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse"></span>

          <div className="relative flex items-center space-x-2.5 font-bold text-xs sm:text-sm">
            <div className="relative">
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <Sparkles className="w-3 h-3 text-sky-200 absolute -top-1 -right-1 animate-spin" />
            </div>
            <span className="hidden md:inline-block font-extrabold tracking-wide">
              Hỏi Lịch AI Voice
            </span>
          </div>
        </button>

        {/* Floating tooltip on desktop */}
        <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block transition-all duration-200 pointer-events-none">
          <div className="bg-[#0b1c2e] text-sky-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-sky-500/30 shadow-xl whitespace-nowrap">
            🎙️ Hỏi nhanh: Hôm nay, ngày mai, ngày kia có lịch gì?
          </div>
        </div>
      </div>

      <VoiceAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
