import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Calendar,
  Clock,
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Zap,
  MapPin,
  Check,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function AiAgentDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'analytics'
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `👋 **Hello! I am your AI Smart College Event & Hall Booking Assistant.**\n\nI can help you analyze hall availability, recommend suitable venues, detect scheduling conflicts, and instantly process hall bookings through voice or text.\n\nHow can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickPrompts: [
        'Find available hall for 100 students tomorrow',
        'Show monthly hall utilization insights',
        'What hall is suitable for 600 people?',
        'Book Seminar Hall 1 tomorrow 10 AM to 1 PM'
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [conversationState, setConversationState] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(true);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    fetchInsights();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await api.get('/ai/insights');
      setInsights(res.data);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const speakText = (text) => {
    if (!textToSpeech || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop current speech
    // Clean markdown symbols for cleaner TTS
    const cleanText = text.replace(/[*#_`]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend || !textToSend.trim() || isTyping) return;

    const userText = textToSend.trim();
    setInputMessage('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsgObj = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userText,
        conversationState
      });

      const data = res.data;
      if (data.conversationState) {
        setConversationState(data.conversationState);
      }

      const aiMsgObj = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: data.recommendations || null,
        bookingConfirmation: data.bookingConfirmation || null,
        insights: data.insights || null,
        quickPrompts: data.quickPrompts || null,
        intent: data.intent || null
      };

      setMessages((prev) => [...prev, aiMsgObj]);
      speakText(data.reply);

      if (data.intent === 'GET_INSIGHTS') {
        fetchInsights();
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: '⚠️ I encountered a temporary connection issue. Please check your network and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleSendMessage(promptText);
  };

  const handleSelectHallToBook = (hall) => {
    const confirmPrompt = `Yes, book ${hall.hall_name}`;
    handleSendMessage(confirmPrompt);
  };

  const renderFormattedText = (text) => {
    return text.split('\n').map((line, idx) => {
      // Basic markdown styling for **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-extrabold text-amber-300">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-purple-950/60 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-blue-500/30 flex items-center justify-center animate-pulse">
              <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  AI Smart Event & Hall Booking Assistant
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-spin" /> AI 2.0 Powered
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Conversational natural language & voice agent for event recommendation, real-time availability analysis, conflict resolution, and instant hall reservations.
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Controls */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900/90 p-1 rounded-2xl border border-slate-800 flex items-center">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" /> AI Chat Agent
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Hall Utilization & Insights
              </button>
            </div>

            <button
              onClick={() => setTextToSpeech(!textToSpeech)}
              title={textToSpeech ? 'Mute AI Voice Speech' : 'Enable AI Voice Speech'}
              className={`p-2.5 rounded-xl border transition-all ${
                textToSpeech
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              {textToSpeech ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AI CONVERSATIONAL CHAT INTERFACE */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Container */}
          <div className="lg:col-span-3 glass-panel rounded-3xl border border-slate-800/80 flex flex-col h-[650px] shadow-2xl overflow-hidden bg-slate-950/70">
            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none border border-blue-400/30'
                        : 'glass-panel bg-slate-900/90 text-slate-100 rounded-bl-none border border-slate-800'
                    }`}
                  >
                    {/* Header line for sender */}
                    <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/10">
                      <span className="text-[11px] font-extrabold flex items-center gap-1.5">
                        {msg.sender === 'user' ? (
                          <>
                            <Users className="w-3.5 h-3.5 text-blue-200" /> You ({user?.department_code || 'Guest'})
                          </>
                        ) : (
                          <>
                            <Bot className="w-3.5 h-3.5 text-blue-400" /> AI Event Assistant
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    {/* Main text message */}
                    <div className="text-xs sm:text-sm leading-relaxed">
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* INLINE AVAILABLE HALL CARDS */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                        <span className="text-[11px] font-extrabold text-blue-300 uppercase tracking-wider block flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" /> Available Halls Found:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.recommendations.map((hall) => (
                            <div
                              key={hall.id}
                              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-extrabold text-xs text-white truncate">{hall.hall_name}</span>
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    Available
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 space-y-0.5">
                                  <p className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-amber-400" /> Capacity: <strong className="text-slate-200">{hall.capacity} Seats</strong>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-purple-400" /> {hall.location}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleSelectHallToBook(hall)}
                                className="mt-3 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30"
                              >
                                <Check className="w-3.5 h-3.5" /> Book {hall.hall_name}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INLINE BOOKING CONFIRMATION RECEIPT CARD */}
                    {msg.bookingConfirmation && (
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 text-xs space-y-2 shadow-2xl">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                          <span className="font-black text-emerald-400 text-sm flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Reservation Confirmed
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40">
                            #REF-{msg.bookingConfirmation.id}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Event Title:</span>
                            <strong className="text-white">{msg.bookingConfirmation.event_name}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Hall:</span>
                            <strong className="text-amber-300">{msg.bookingConfirmation.hall_name}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Date:</span>
                            <strong className="text-slate-200">{msg.bookingConfirmation.event_date}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Timing:</span>
                            <strong className="text-slate-200">{msg.bookingConfirmation.start_time} – {msg.bookingConfirmation.end_time}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QUICK PROMPT BUTTONS ATTACHED TO AI RESPONSE */}
                    {msg.quickPrompts && msg.quickPrompts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                        {msg.quickPrompts.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleQuickPrompt(prompt)}
                            className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-400 transition-all flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-400" /> {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* AI Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="glass-panel p-4 rounded-3xl rounded-bl-none border border-slate-800 bg-slate-900/90 text-slate-300 flex items-center space-x-3 shadow-xl">
                    <Bot className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs font-semibold animate-pulse">AI Agent is analyzing hall availability & conflict rules...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar & Voice Controls */}
            <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2">
                {/* Voice Input Mic Button */}
                <button
                  onClick={handleToggleVoiceInput}
                  className={`p-3 rounded-2xl border transition-all flex-shrink-0 relative ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/40'
                      : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                  title={isListening ? 'Listening... Click to stop' : 'Click to speak (Voice Recognition)'}
                >
                  {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-blue-400" />}
                  {isListening && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </button>

                {/* Text Input Box */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    isListening
                      ? 'Listening to your voice request...'
                      : 'Ask AI Agent (e.g. "Book hall tomorrow 10 AM to 1 PM for 100 students")...'
                  }
                  className="flex-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
                />

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {isListening && (
                <div className="mt-2 text-[11px] font-bold text-rose-400 flex items-center justify-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Listening... Speak your booking request now.
                </div>
              )}
            </div>
          </div>

          {/* Right Side Panel: AI Assistant Features & Quick Prompts */}
          <div className="space-y-4">
            {/* Quick Action Suggestions Card */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-950/70 space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Recommended AI Prompts
              </h3>
              <div className="space-y-2">
                {[
                  'Book Seminar Hall 1 tomorrow 10 AM to 1 PM',
                  'Find hall for 500 students next Monday',
                  'Show hall utilization insights for this month',
                  'What hall is suitable for a technical workshop?',
                  'Check if Main Auditorium is free tomorrow'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-blue-900/30 text-slate-300 hover:text-white border border-slate-800 hover:border-blue-500/40 text-xs transition-all flex items-center justify-between group"
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Capability Badges */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-950/70 space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" /> Core Capabilities
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block">Strict Conflict Lock</strong>
                    Calculates instant atomic time overlaps against live DB.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/50">
                  <Mic className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block">Voice Speech Recognition</strong>
                    Speak hands-free to query or request venue bookings.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/50">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block">Smart Slot Filling</strong>
                    Asks precise follow-up questions for missing details.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HALL UTILIZATION & MONTHLY INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loadingInsights ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-400" /> Computing real-time hall utilization analytics...
            </div>
          ) : insights ? (
            <>
              {/* Top Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-950/70">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Total System Bookings</span>
                  <div className="text-2xl font-black text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-400" /> {insights.totalBookings}
                  </div>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-950/70">
                  <span className="text-xs font-bold text-slate-400 block mb-1">🔥 Most Occupied Hall</span>
                  <div className="text-lg font-extrabold text-amber-300 truncate">
                    {insights.mostBusyHall}
                  </div>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-950/70">
                  <span className="text-xs font-bold text-slate-400 block mb-1">🟢 Highest Availability</span>
                  <div className="text-lg font-extrabold text-emerald-400 truncate">
                    {insights.leastBusyHall}
                  </div>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-950/70">
                  <span className="text-xs font-bold text-slate-400 block mb-1">⚡ Recommended Window</span>
                  <div className="text-sm font-extrabold text-purple-300">
                    Afternoon (2 PM - 5 PM)
                  </div>
                </div>
              </div>

              {/* Detailed Utilization Bars per Hall */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/70 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" /> Monthly Hall Occupancy Distribution
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Relative utilization percentage based on confirmed department bookings.
                    </p>
                  </div>
                  <button
                    onClick={fetchInsights}
                    className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {insights.hallUsage.map((hall) => (
                    <div key={hall.id} className="space-y-1.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-400" /> {hall.name} ({hall.type})
                        </span>
                        <span className="text-amber-300 font-mono">
                          {hall.bookingCount} Bookings | {hall.totalAttendees} Total Attendees ({hall.utilizationScore}% Share)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${Math.max(8, hall.utilizationScore)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Capacity: {hall.capacity} Seats</span>
                        <span className="text-emerald-400">Status: Active & Operational</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
