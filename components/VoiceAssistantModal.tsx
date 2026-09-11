'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Loader2,
  Bot,
  User,
  Clock,
  HelpCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface MessageItem {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  time: string;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  initialQuery,
}: VoiceAssistantModalProps) {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoTts, setAutoTts] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check auth user status
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Quick suggestion chips
  const suggestions = [
    'Hôm nay tôi có lịch gì môn gì?',
    'Ngày mai tôi học môn gì?',
    'Ngày kia có lịch học gì không?',
    'Phòng học các môn tuần này ở đâu?',
  ];

  // Initialize Web Speech API Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'vi-VN';

        rec.onstart = () => {
          setIsListening(true);
          setErrorMsg(null);
        };

        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          setInputQuery(currentTranscript);
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setErrorMsg('Quyền truy cập Micro bị từ chối. Vui lòng cấp quyền micro trong trình duyệt.');
          } else if (event.error !== 'no-speech') {
            setErrorMsg('Lỗi nhận diện giọng nói. Bạn có thể gõ câu hỏi bên dưới.');
          }
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, isListening]);

  // Initial welcome message or auto trigger query
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            type: 'assistant',
            text: 'Xin chào! Bạn có thể bấm nút Micro để hỏi: "Hôm nay, ngày mai, ngày kia có lịch gì môn gì?" hoặc chọn các câu hỏi mẫu bên dưới nhé!',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }

      if (initialQuery) {
        handleQuerySubmit(initialQuery);
      }
    } else {
      // Stop speech & synthesis when modal closes
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, initialQuery]);

  const startListening = () => {
    stopSpeaking();
    if (!speechSupported || !recognitionRef.current) {
      setErrorMsg('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng gõ câu hỏi.');
      return;
    }

    try {
      setTranscript('');
      setInputQuery('');
      recognitionRef.current.start();
    } catch (err: any) {
      console.error('Lỗi khi bật Micro:', err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown/asterisks before TTS
    const cleanText = text.replace(/[*#_~`]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try finding Vietnamese voice
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VI'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleQuerySubmit = async (queryToSubmit?: string) => {
    const q = (queryToSubmit || inputQuery || transcript).trim();
    if (!q || isLoading) return;

    stopListening();
    stopSpeaking();

    const userTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, type: 'user', text: q, time: userTime },
    ]);

    setInputQuery('');
    setTranscript('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const aiTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const aiMsgId = `ai-${Date.now()}`;
        const answerText = data.answer;

        setMessages((prev) => [
          ...prev,
          { id: aiMsgId, type: 'assistant', text: answerText, time: aiTime },
        ]);

        if (autoTts) {
          speakText(answerText);
        }
      } else {
        setErrorMsg(data.error || 'Không thể lấy phản hồi từ AI');
      }
    } catch (err: any) {
      console.error('Lỗi khi gửi câu hỏi AI:', err);
      setErrorMsg('Lỗi mạng khi kết nối với AI');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0b1b2d] border border-sky-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-[#081524] border-b border-sky-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Hỏi Đáp Lịch Học AI Voice</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Gemini 3.6
                </span>
              </h2>
              <p className="text-xs text-sky-300/70">Tìm kiếm nhanh hôm nay, ngày mai, ngày kia</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio TTS toggle */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setAutoTts(!autoTts);
              }}
              className={`p-2 rounded-xl text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                autoTts
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-sky-950/40 text-sky-400/60 border-sky-900/40'
              }`}
              title={autoTts ? 'Đang bật đọc giọng nói (TTS)' : 'Đang tắt đọc giọng nói'}
            >
              {autoTts ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-sky-300/70 hover:text-white hover:bg-sky-900/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Conversation Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-[280px] bg-[#071321]/60 flex flex-col justify-between"
        >
          {checkingAuth ? (
            <div className="py-12 text-center space-y-3 my-auto">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
              <p className="text-xs text-sky-200/70">Đang xác thực thông tin tài khoản...</p>
            </div>
          ) : !currentUser ? (
            <div className="glass-card p-6 sm:p-8 text-center space-y-4 my-auto max-w-md mx-auto rounded-3xl border border-sky-500/30 bg-[#0c2035]/90 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto ring-1 ring-sky-500/30">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-white">Yêu Cầu Đăng Nhập</h3>
                <p className="text-xs text-sky-200/70 leading-relaxed">
                  Bạn cần đăng nhập tài khoản trước để Trợ Lý AI biết thời khóa biểu của bạn và trả lời chính xác lịch học của ai.
                </p>
              </div>
              <Link
                href="/login"
                onClick={onClose}
                className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 transition-all sky-bounce"
              >
                <span>Đăng Nhập / Đăng Ký Ngay</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      msg.type === 'user'
                        ? 'bg-sky-600 text-white'
                        : 'bg-sky-950 border border-sky-500/30 text-sky-400'
                    }`}
                  >
                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-sky-600/20'
                        : 'bg-[#0f243b] text-sky-100 border border-sky-500/20 rounded-tl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">{msg.text}</div>
                    <div
                      className={`text-[10px] text-right ${
                        msg.type === 'user' ? 'text-sky-200/70' : 'text-sky-400/60'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Thinking Loader */}
              {isLoading && (
                <div className="flex items-center space-x-3 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#0f243b] border border-sky-500/20 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-sky-300 flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Gemini AI đang tra cứu lịch học...</span>
                  </div>
                </div>
              )}

              {/* Voice Listening Active Soundwave */}
              {isListening && (
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-center space-y-2 animate-in fade-in">
                  <div className="flex justify-center items-center space-x-1.5 h-6">
                    <span className="w-1.5 h-full bg-sky-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-full bg-sky-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-full bg-sky-400 rounded-full animate-bounce delay-300"></span>
                    <span className="w-1.5 h-full bg-sky-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-full bg-sky-400 rounded-full animate-bounce delay-75"></span>
                  </div>
                  <p className="text-xs font-semibold text-sky-300">
                    Đang lắng nghe... Nói câu hỏi của bạn (vd: "Hôm nay có môn gì?")
                  </p>
                  {transcript && (
                    <p className="text-xs italic text-sky-100 bg-sky-950/60 p-2 rounded-xl border border-sky-500/20">
                      "{transcript}"
                    </p>
                  )}
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-normal">
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#081524] border-t border-sky-900/40 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-sky-400 font-semibold shrink-0 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Gợi ý:</span>
          </span>
          {suggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleQuerySubmit(chip)}
              disabled={isLoading || isListening || !currentUser}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#10243a] hover:bg-sky-500/20 text-sky-200 hover:text-sky-300 border border-sky-500/20 transition-all shrink-0 sky-bounce disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Bottom Voice & Text Input Controls */}
        <div className="p-4 bg-[#071422] border-t border-sky-900/40 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuerySubmit();
            }}
            className="flex items-center space-x-2"
          >
            {/* Mic Big Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || !currentUser}
              className={`p-3.5 rounded-2xl font-bold transition-all shadow-lg shrink-0 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/30'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
              } disabled:opacity-40 sky-bounce`}
              title={isListening ? 'Bấm để dừng nghe' : 'Bấm để nói bằng Giọng nói (Voice)'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Input Text Box */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  !currentUser
                    ? 'Bạn cần đăng nhập để dùng trợ lý AI...'
                    : isListening
                    ? 'Đang lắng nghe giọng nói của bạn...'
                    : 'Gõ câu hỏi: Hôm nay, ngày mai, ngày kia có lịch gì...'
                }
                disabled={isLoading || !currentUser}
                className="w-full bg-[#0d2036] text-white text-xs sm:text-sm placeholder-sky-300/40 px-4 py-3 rounded-2xl border border-sky-500/20 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all disabled:opacity-50"
              />
            </div>

            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading || !currentUser}
              className="p-3.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold transition-all disabled:opacity-40 shrink-0 sky-bounce"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>

          {/* Active Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center justify-between text-xs text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
              <span className="flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-sky-400 animate-bounce" />
                <span>AI đang đọc câu trả lời bằng giọng nói...</span>
              </span>
              <button
                onClick={stopSpeaking}
                className="text-[11px] font-semibold text-sky-400 underline hover:text-white"
              >
                Dừng đọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
