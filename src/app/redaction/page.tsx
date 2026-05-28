'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function RedactionPage() {
  const [contentType, setContentType] = useState<'blog' | 'linkedin' | 'newsletter'>('blog');
  const [tone, setTone] = useState<'professionnel' | 'expert' | 'storytelling'>('professionnel');
  const [length, setLength] = useState<'court' | 'moyen' | 'long'>('moyen');
  const [inputMessage, setInputMessage] = useState('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Bonjour ! Je suis votre assistant IA pour la création de contenu SEO. Décrivez-moi le contenu que vous souhaitez créer et je vous aiderai à le rédiger.',
      time: '16:27',
    },
    {
      id: 2,
      sender: 'user',
      text: 'Bonjour ! Je souhaiterai rédiger un article de blog sur les chats.',
      time: '16:27',
    },
    {
      id: 3,
      sender: 'ai',
      isArticle: true,
      text: "Le Mystère du Quart d'Heure de Folie 🐈\nTout propriétaire de chat connaît ce moment : sans prévenir, votre félin se transforme en bolide, dévalant les couloirs et grimpant aux rideaux comme s'il chassait des fantômes. Ce phénomène, surnommé \"zoomies\" (ou FRAPs en anglais), est tout simplement une manière saine de libérer un surplus d'énergie accumulé pendant ses 16 heures de sieste quotidiennes.\nLe conseil du jour : Ne tentez pas de l'arrêter, assurez-vous juste que rien ne traîne sur son passage !",
      time: '16:27',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: 'user',
        text: inputMessage,
        time: '16:27',
      },
    ]);
    setInputMessage('');
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 relative overflow-hidden">
      
      <div className="flex-1 flex flex-col bg-white h-full transition-all duration-300">
        
        <div className="px-8 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Image src="/icons/contenu-ia.png" alt="" width={18} height={18} className="opacity-90" />
            <h2 className="font-bold text-gray-900 text-lg">Rédaction de contenu IA</h2>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-lg border transition-all ${
              isSettingsOpen 
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'hover:bg-gray-100 border-gray-200 text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-16 py-8 space-y-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col w-full ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="border border-gray-200 rounded-xl p-5 relative max-w-2xl bg-white">
                <p className="text-sm leading-relaxed whitespace-pre-line pr-4 text-gray-900">
                  {msg.text}
                </p>
                <span className="text-[10px] text-gray-400 block text-right mt-2">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Décrivez le contenu que vous souhaitez créer..."
              className="flex-1 border border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-400 bg-white"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-11 w-14 flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
            >
              <Image src="/icons/envoyer.png" alt="Envoyer" width={16} height={16} className="brightness-0 invert transform rotate-90" />
            </button>
          </form>
        </div>
      </div>

      <div 
        className={`border-l border-gray-200 flex flex-col bg-white h-full flex-shrink-0 transition-all duration-300 ${
          isSettingsOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 pointer-events-none border-l-0'
        }`}
      >
        <div className="w-72 flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900">Paramètres</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm">
            <div>
              <h3 className="text-gray-500 font-medium mb-4 text-xs">Type de contenu</h3>
              <div className="space-y-4">
                {[
                  { id: 'blog', label: 'Article de blog' },
                  { id: 'linkedin', label: 'Post LinkedIn' },
                  { id: 'newsletter', label: 'Newsletter' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer text-gray-700">
                    <input
                      type="checkbox"
                      checked={contentType === item.id}
                      onChange={() => setContentType(item.id as any)}
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-gray-500 font-medium mb-4 text-xs">Ton</h3>
              <div className="space-y-4">
                {[
                  { id: 'professionnel', label: 'Professionnel' },
                  { id: 'expert', label: 'Expert' },
                  { id: 'storytelling', label: 'Storytelling' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer text-gray-700">
                    <input
                      type="radio"
                      name="tone"
                      checked={tone === item.id}
                      onChange={() => setTone(item.id as any)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-gray-500 font-medium mb-4 text-xs">Longueur</h3>
              <div className="space-y-4">
                {[
                  { id: 'court', label: 'Court (300-500 mots)' },
                  { id: 'moyen', label: 'Moyen (500-1000 mots)' },
                  { id: 'long', label: 'Long (1000+ mots)' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer text-gray-700">
                    <input
                      type="radio"
                      name="length"
                      checked={length === item.id}
                      onChange={() => setLength(item.id as any)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}