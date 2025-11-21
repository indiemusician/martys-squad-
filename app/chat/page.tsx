'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  coach?: string;
  timestamp?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Yo ! Content de te voir ici 💪

Je suis Marty, ton manager musical virtuel créé par Clem.

Avec moi tu as accès à toute l'équipe d'Indie Musician :
• Luke - Identité artistique
• Peter - Réseaux sociaux
• Riplay - Stratégie Spotify
• April - Plan promo
• Clarice - Déblocages mentaux

Dis-moi :
👉 Tu t'appelles comment en tant qu'artiste ?
👉 C'est quoi ton style musical ?
👉 Tu veux bosser sur quoi en priorité ?`,
      coach: 'marty',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCoach, setCurrentCoach] = useState<string>('marty');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          coach: currentCoach,
          conversationId: conversationId,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        coach: data.coach,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentCoach(data.coach);

      // Sauvegarder le conversationId pour la suite
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Désolé, j'ai eu un problème. Peux-tu réessayer ?",
        coach: currentCoach,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getCoachEmoji = (coach?: string) => {
    const emojis: Record<string, string> = {
      marty: '🎙️',
      luke: '🎨',
      peter: '📱',
      riplay: '🎧',
      april: '📅',
      clarice: '💭',
    };
    return emojis[coach || 'marty'] || '🎸';
  };

  const getCoachName = (coach?: string) => {
    const names: Record<string, string> = {
      marty: 'Marty',
      luke: 'Luke',
      peter: 'Peter',
      riplay: 'Riplay',
      april: 'April',
      clarice: 'Clarice',
    };
    return names[coach || 'marty'] || 'Coach';
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🎸 Marty&apos;s Squad
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Coaching musical par IA • Actuellement avec{' '}
              <span className="text-purple-400 font-semibold">
                {getCoachEmoji(currentCoach)} {getCoachName(currentCoach)}
              </span>
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            En ligne
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-purple-500/20'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-purple-300">
                    <span className="text-lg">{getCoachEmoji(message.coach)}</span>
                    <span className="font-semibold">{getCoachName(message.coach)}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></span>
                  </div>
                  <span className="text-sm">
                    {getCoachName(currentCoach)} réfléchit...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-purple-500/30 bg-black/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Écris ton message ici... (Entrée pour envoyer)"
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-gray-800/80 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:opacity-50 placeholder-gray-500"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 font-semibold transition-colors"
            >
              {isLoading ? '...' : 'Envoyer'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Appuie sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
          </p>
        </div>
      </div>
    </div>
  );
}
