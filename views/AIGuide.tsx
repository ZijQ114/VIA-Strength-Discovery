import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage, Activity } from '../types';
import { analyzeMoodAndSuggest, reverseAnalyzeAction } from '../services/geminiService';
import StrengthIcon from '../components/StrengthIcon';
import { Send, Bot, User as UserIcon, Loader2, MessageSquare, Search } from 'lucide-react';
import { ALL_STRENGTHS } from '../constants';

interface Props {
  profile: UserProfile;
  onAddActivity: (activity: Activity) => void;
}

const AIGuide: React.FC<Props> = ({ profile, onAddActivity }) => {
  const [mode, setMode] = useState<'chat' | 'analyze'>('chat');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm your Strength Guide. Tell me how you're feeling, and I can suggest an activity to help. Or switch modes to analyze a past action."
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    setInput('');
    setLoading(true);

    // Add user message
    const newMessages = [...messages, { id: crypto.randomUUID(), role: 'user', text: userText } as ChatMessage];
    setMessages(newMessages);

    if (mode === 'chat') {
      // Mood Analysis
      try {
        const suggestedActivities = await analyzeMoodAndSuggest(userText, profile);
        const replyText = suggestedActivities.length > 0 
          ? `I hear you. Here are two ways you can use your strengths to navigate this:` 
          : "I'm having trouble connecting right now, but I'm listening.";
        
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'model',
          text: replyText,
          suggestedActivities
        }]);
      } catch (e) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: "Sorry, I couldn't process that right now." }]);
      }
    } else {
      // Reverse Analysis
      try {
        const result = await reverseAnalyzeAction(userText);
        if (result) {
          const strength = ALL_STRENGTHS.find(s => s.id === result.strengthId);
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'model',
            text: `That sounds like **${strength?.name}**! \n\nReasoning: ${result.reasoning}`
          }]);
        } else {
          setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: "I couldn't identify a specific strength in that action." }]);
        }
      } catch (e) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: "Error analyzing action." }]);
      }
    }

    setLoading(false);
  };

  return (
    <div className="pb-24 pt-4 px-4 h-screen flex flex-col max-w-2xl mx-auto">
      {/* Mode Switcher */}
      <div className="bg-slate-100 p-1 rounded-xl flex mb-4 shrink-0">
        <button 
          onClick={() => setMode('chat')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex justify-center items-center gap-2 ${
            mode === 'chat' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Mood Support
        </button>
        <button 
          onClick={() => setMode('analyze')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex justify-center items-center gap-2 ${
            mode === 'analyze' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Search className="w-4 h-4" /> Analyze Action
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              
              <div className="space-y-2">
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Suggestions Cards */}
                {msg.suggestedActivities && (
                  <div className="space-y-2 mt-2">
                    {msg.suggestedActivities.map(act => (
                      <div key={act.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <StrengthIcon strengthId={act.strengthId} size="sm" />
                          <h4 className="font-semibold text-slate-800 text-sm">{act.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{act.description}</p>
                        <button 
                          onClick={() => onAddActivity(act)}
                          className="w-full py-1.5 bg-slate-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-100"
                        >
                          Add to Today's Goals
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 shrink-0 bg-white/90 backdrop-blur pb-2">
        <div className="relative">
          <input
            type="text"
            className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400"
            placeholder={mode === 'chat' ? "I'm feeling anxious about..." : "I helped my neighbor with..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGuide;
