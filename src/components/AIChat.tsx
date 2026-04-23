import React, { useState, useEffect, useRef } from 'react';
import { medicalModel } from '../lib/gemini';
import { MessageCircle, Send, Loader2, User, Bot, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Namaste! I am your AI Hospital Assistant for Delhi. How can I help you with your health today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    chatRef.current = medicalModel.getChat();
    
    // Load history from Firebase
    if (auth.currentUser) {
      const chatSessionsRef = collection(db, 'users', auth.currentUser.uid, 'chatSessions');
      const q = query(chatSessionsRef, orderBy('timestamp', 'asc'), limit(50));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          role: doc.data().role as 'user' | 'model',
          content: doc.data().content
        }));
        
        if (history.length > 0) {
          setMessages(history);
        }
      });
      
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Ensure chat is initialized
      if (!chatRef.current) {
        chatRef.current = medicalModel.getChat();
      }

      // Use streaming for better UX
      const stream = await chatRef.current.sendMessageStream({
        message: userMessage
      });

      // Add a placeholder for the bot response
      setMessages(prev => [...prev, { role: 'model', content: '' }]);
      let fullResponse = '';

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.content = fullResponse;
          }
          return newMessages;
        });
      }

      // Persist to Firebase if user is logged in
      if (auth.currentUser) {
        const chatSessionsRef = collection(db, 'users', auth.currentUser.uid, 'chatSessions');
        await addDoc(chatSessionsRef, {
          role: 'user',
          content: userMessage,
          timestamp: serverTimestamp()
        });
        await addDoc(chatSessionsRef, {
          role: 'model',
          content: fullResponse,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I am facing some issues connecting to the brain. Please ensure your session is active and check your network." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden" id="ai-chat-container">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <MessageCircle size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 leading-none">Arogya AI Assistant</h2>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-1">Medical Data Analysis Active</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-xs text-slate-500 italic font-medium">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type symptoms or ask about reports..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
            id="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`absolute right-2 p-2.5 rounded-lg transition-all cursor-pointer ${
              input.trim() ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-400'
            }`}
            id="send-button"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-400 text-center italic">
          Personalized health context is {auth.currentUser ? `active for ${auth.currentUser.displayName?.split(' ')[0]}` : 'not active (Login to persist history)'}.
        </p>
      </div>
    </div>
  );
};
