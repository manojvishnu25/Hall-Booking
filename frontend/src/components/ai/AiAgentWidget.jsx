import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Maximize2,
  Building2,
  CheckCircle2,
  Users,
  MapPin,
  Check
} from 'lucide-react';

export default function AiAgentWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationState, setConversationState] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Hi! Need help booking a hall or checking availability? Just ask me or speak your request!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // If already on the full AI Assistant page (/ai-assistant), don't show the duplicate floating widget
  if (location.pathname === '/ai-assistant') return null;

  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend || !textToSend.trim() || isTyping) return;

    const userText = textToSend.trim();
    setInputMessage('');

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
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

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendations: data.recommendations || null,
          bookingConfirmation: data.bookingConfirmation || null,
          quickPrompts: data.quickPrompts || null
        }
      ]);
    } catch (err) {
      console.error('Widget chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOpenFullDashboard = () => {
    setIsOpen(false);
    navigate('/ai-assistant');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold px-4 py-3 rounded-full shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all duration-300 border border-blue-400/40"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <span className="text-xs tracking-tight hidden sm:inline">AI Booking Assistant</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        </button>
      )}

      {/* Floating Widget Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] glass-panel bg-slate-950/95 rounded-3xl border border-blue-500/30 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Top Widget Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  AI Event Assistant <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h4>
                <span className="text-[10px] text-slate-400 block">Smart Booking & Recommendations</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleOpenFullDashboard}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Open Full AI Dashboard"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Widget Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Inline Recommendations in Widget */}
                  {msg.recommendations && (
                    <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-800">
                      {msg.recommendations.slice(0, 2).map((hall) => (
                        <div key={hall.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <strong className="text-[11px] text-white block">{hall.hall_name}</strong>
                            <span className="text-[10px] text-slate-400">{hall.capacity} Seats</span>
                          </div>
                          <button
                            onClick={() => handleSendMessage(`Yes, book ${hall.hall_name}`)}
                            className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px]"
                          >
                            Book
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Confirmation Receipt in Widget */}
                  {msg.bookingConfirmation && (
                    <div className="mt-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[11px] text-emerald-300">
                      ✅ Reserved #{msg.bookingConfirmation.id} for {msg.bookingConfirmation.hall_name}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="p-2.5 rounded-2xl bg-slate-900 text-slate-400 text-xs flex items-center space-x-2">
                  <Bot className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Bar */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => handleSendMessage('Find hall for 100 students tomorrow')}
              className="px-2 py-1 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-[10px] whitespace-nowrap"
            >
              ⚡ Hall tomorrow
            </button>
            <button
              onClick={() => handleSendMessage('Show hall utilization insights')}
              className="px-2 py-1 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-[10px] whitespace-nowrap"
            >
              📊 Insights
            </button>
          </div>

          {/* Widget Input */}
          <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI Assistant..."
              className="flex-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="p-2 rounded-xl bg-blue-600 text-white text-xs disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
