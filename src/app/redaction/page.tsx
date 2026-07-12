"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiError, generateContent, getCurrentAgency } from "@/lib/api";

type ContentType = "blog" | "linkedin" | "newsletter";
type Tone = "professionnel" | "expert" | "storytelling";
type ContentLength = "court" | "moyen" | "long";

type ChatMessage = {
  id: number;
  sender: "ai" | "user";
  text: string;
  time: string;
  model?: string;
};

const contentTypeOptions: Array<{ id: ContentType; label: string }> = [
  { id: "blog", label: "Article de blog" },
  { id: "linkedin", label: "Post LinkedIn" },
  { id: "newsletter", label: "Newsletter" },
];

const toneOptions: Array<{ id: Tone; label: string }> = [
  { id: "professionnel", label: "Professionnel" },
  { id: "expert", label: "Expert" },
  { id: "storytelling", label: "Storytelling" },
];

const lengthOptions: Array<{
  id: ContentLength;
  label: string;
  maxTokens: number;
}> = [
  { id: "court", label: "Court", maxTokens: 600 },
  { id: "moyen", label: "Moyen", maxTokens: 1200 },
  { id: "long", label: "Long", maxTokens: 2200 },
];

function formatTime() {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Vous devez être connecté pour utiliser la rédaction IA.";
    }

    if (error.status === 400 && error.message.includes("not configured")) {
      return "Gemini n'est pas encore configuré côté serveur.";
    }

    return error.message;
  }

  return "Impossible de générer le contenu pour le moment.";
}

export default function RedactionPage() {
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [tone, setTone] = useState<Tone>("professionnel");
  const [length, setLength] = useState<ContentLength>("moyen");
  const [inputMessage, setInputMessage] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "ai",
      text: "Bonjour. Décrivez le contenu à produire, et Gemini générera une première version structurée.",
      time: "",
    },
  ]);

  const selectedContentType = contentTypeOptions.find(
    (option) => option.id === contentType,
  );
  const selectedTone = toneOptions.find((option) => option.id === tone);
  const selectedLength = lengthOptions.find((option) => option.id === length);
  const needsAuthentication =
    error === "Vous devez être connecté pour utiliser la rédaction IA.";

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = inputMessage.trim();

    if (!prompt || isGenerating) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: prompt,
      time: formatTime(),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputMessage("");
    setError(null);
    setIsGenerating(true);

    try {
      const currentAgency = await getCurrentAgency();

      const result = await generateContent(currentAgency.agency.id, {
        title: prompt.slice(0, 200),
        brief: prompt,
        contentType: selectedContentType?.label ?? contentType,
        channel: selectedContentType?.label ?? contentType,
        tone: selectedTone?.label ?? tone,
        language: "francais",
        saveDraft: true,
        provider: "gemini",
        temperature: tone === "storytelling" ? 0.8 : 0.5,
        maxTokens: selectedLength?.maxTokens ?? 1200,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: result.content,
          time: formatTime(),
          model: result.ai.model,
        },
      ]);
    } catch (caughtError) {
      const message = getErrorMessage(caughtError);
      setError(message);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: message,
          time: formatTime(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 relative overflow-hidden">
      <div className="flex-1 flex flex-col bg-white h-full transition-all duration-300">
        <div className="px-8 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/contenu-ia.png"
              alt=""
              width={18}
              height={18}
              className="opacity-90"
            />
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Rédaction IA</h1>
              <p className="text-xs text-gray-500">Assistant Gemini.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`px-3 py-2 rounded-lg border transition-all text-sm font-semibold ${
              isSettingsOpen
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "hover:bg-gray-100 border-gray-200 text-gray-700"
            }`}
          >
            Réglages
          </button>
        </div>

        {error ? (
          <div className="mx-8 mt-4 bg-red-50 border border-red-100 rounded-lg p-3 text-sm font-medium text-red-600">
            <p>{error}</p>
            {needsAuthentication ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  href="/connexion?redirect=/redaction"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription?redirect=/redaction"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                >
                  Créer un compte
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-8 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col w-full ${
                message.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`border rounded-lg p-5 relative max-w-3xl ${
                  message.sender === "user"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {message.text}
                </p>
                <div
                  className={`text-[10px] mt-3 flex justify-end gap-2 ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-gray-400"
                  }`}
                >
                  {message.model ? <span>{message.model}</span> : null}
                  {message.time ? <span>{message.time}</span> : null}
                </div>
              </div>
            </div>
          ))}

          {isGenerating ? (
            <div className="text-sm text-gray-500">Gemini rédige...</div>
          ) : null}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex gap-3 items-center"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(event) => setInputMessage(event.target.value)}
              placeholder="Décrivez le contenu que vous souhaitez créer..."
              className="flex-1 border border-gray-200 rounded-lg px-5 py-3 text-sm focus:outline-none focus:border-gray-400 placeholder-gray-400 bg-white"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg h-11 px-5 flex items-center justify-center transition-colors shadow-sm flex-shrink-0 text-sm font-semibold"
            >
              {isGenerating ? "..." : "Envoyer"}
            </button>
          </form>
        </div>
      </div>

      <div
        className={`border-l border-gray-200 flex flex-col bg-white h-full flex-shrink-0 transition-all duration-300 ${
          isSettingsOpen
            ? "w-72 opacity-100"
            : "w-0 opacity-0 pointer-events-none border-l-0"
        }`}
      >
        <div className="w-72 flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Réglages</h2>
            <p className="text-xs text-gray-500 mt-1">
              Contexte envoyé à Gemini.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm">
            <div>
              <h3 className="text-gray-500 font-medium mb-4 text-xs uppercase">
                Type de contenu
              </h3>
              <div className="space-y-3">
                {contentTypeOptions.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer text-gray-700"
                  >
                    <input
                      type="radio"
                      name="contentType"
                      checked={contentType === item.id}
                      onChange={() => setContentType(item.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-gray-500 font-medium mb-4 text-xs uppercase">
                Ton
              </h3>
              <div className="space-y-3">
                {toneOptions.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer text-gray-700"
                  >
                    <input
                      type="radio"
                      name="tone"
                      checked={tone === item.id}
                      onChange={() => setTone(item.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-gray-500 font-medium mb-4 text-xs uppercase">
                Longueur
              </h3>
              <div className="space-y-3">
                {lengthOptions.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer text-gray-700"
                  >
                    <input
                      type="radio"
                      name="length"
                      checked={length === item.id}
                      onChange={() => setLength(item.id)}
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
