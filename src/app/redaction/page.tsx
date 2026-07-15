"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";
import {
  ApiError,
  ContentItem,
  CurrentAgency,
  generateContent,
  getContentItem,
  getCurrentAgency,
  updateContentItem,
} from "@/lib/api";

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
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [tone, setTone] = useState<Tone>("professionnel");
  const [length, setLength] = useState<ContentLength>("moyen");
  const [inputMessage, setInputMessage] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAgency, setCurrentAgency] = useState<CurrentAgency | null>(null);
  const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
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

  useEffect(() => {
    let ignoreResult = false;

    async function loadContext() {
      setIsLoadingContent(true);

      try {
        const agency = await getCurrentAgency();
        if (ignoreResult) return;
        setCurrentAgency(agency);

        const contentId = new URLSearchParams(window.location.search).get("contentId");
        if (!contentId) return;

        const content = await getContentItem(agency.agency.id, contentId);
        if (ignoreResult) return;

        setActiveContent(content);

        const matchingType = contentTypeOptions.find(
          (option) => option.label.toLowerCase() === content.contentType?.toLowerCase(),
        );
        if (matchingType) setContentType(matchingType.id);

        setMessages([
          {
            id: Date.now(),
            sender: "ai",
            text: content.body
              ? `Brouillon chargé : « ${content.title} »\n\n${content.body}`
              : `Le brief « ${content.title} » est prêt. ${
                  content.notes
                    ? `Contexte disponible : ${content.notes}`
                    : "Indiquez-moi l’angle ou les consignes à appliquer."
                }`,
            time: "",
          },
        ]);
        setInputMessage(
          content.body
            ? "Améliore ce brouillon en conservant son intention et sa structure."
            : `Rédige une première version complète pour « ${content.title} ».`,
        );
      } catch (caughtError) {
        if (!ignoreResult) setError(getErrorMessage(caughtError));
      } finally {
        if (!ignoreResult) setIsLoadingContent(false);
      }
    }

    void loadContext();
    return () => {
      ignoreResult = true;
    };
  }, []);

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
      const agency = currentAgency ?? (await getCurrentAgency());

      const result = await generateContent(agency.agency.id, {
        title: activeContent?.title ?? prompt.slice(0, 200),
        brief: [activeContent?.notes, prompt].filter(Boolean).join("\n\n"),
        contentType: selectedContentType?.label ?? contentType,
        channel: selectedContentType?.label ?? contentType,
        tone: selectedTone?.label ?? tone,
        language: "francais",
        saveDraft: !activeContent,
        provider: "gemini",
        temperature: tone === "storytelling" ? 0.8 : 0.5,
        maxTokens: selectedLength?.maxTokens ?? 1200,
      });

      let savedContent = result.item ?? activeContent;
      if (activeContent) {
        savedContent = await updateContentItem(agency.agency.id, activeContent.id, {
          body: result.content,
          status: "DRAFT",
          contentType: selectedContentType?.label ?? contentType,
          channel: selectedContentType?.label ?? contentType,
        });
      }

      if (savedContent) {
        setActiveContent(savedContent);
        if (!activeContent) {
          router.replace(`/redaction?contentId=${savedContent.id}`);
        }
      }

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
    <div className="relative flex h-full min-h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#f7f8fc] text-slate-800 md:min-h-0">
      <div className="flex h-full flex-1 flex-col transition-all duration-300">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/85 px-4 py-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/contenu-ia.png"
              alt=""
              width={18}
              height={18}
              className="rounded-lg bg-indigo-50 p-1 opacity-90"
            />
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-950">
                {activeContent?.title || "Rédaction IA"}
              </h1>
              <p className="text-xs font-medium text-slate-500">
                {activeContent ? "Brouillon enregistré automatiquement" : "Assistant Gemini"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeContent ? (
              <Link
                href="/contenus"
                className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                Voir mes contenus
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`rounded-xl border px-3 py-2 text-sm font-bold transition-all ${
                isSettingsOpen
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Réglages
            </button>
          </div>
        </div>

        {error ? (
          <div className="mx-4 mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700 sm:mx-8">
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

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8 lg:px-16 lg:py-8">
          {isLoadingContent ? (
            <div className="text-sm text-gray-500">Chargement du brief…</div>
          ) : null}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col w-full ${
                message.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`relative max-w-3xl rounded-2xl border p-5 ${
                  message.sender === "user"
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "border-slate-200 bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                }`}
              >
                {message.sender === "ai" ? (
                  <MarkdownContent className="text-slate-800">
                    {message.text}
                  </MarkdownContent>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.text}
                  </p>
                )}
                <div
                  className={`text-[10px] mt-3 flex justify-end gap-2 ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-slate-400"
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

        <div className="border-t border-slate-200/80 bg-white/90 p-4 backdrop-blur sm:p-6">
          <form
            onSubmit={handleSendMessage}
            className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(event) => setInputMessage(event.target.value)}
              placeholder={
                activeContent
                  ? "Décrivez la modification ou la version souhaitée…"
                  : "Décrivez le contenu que vous souhaitez créer…"
              }
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isGenerating}
              className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm shadow-indigo-600/25 transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
            >
              {isGenerating ? "..." : "Envoyer"}
            </button>
          </form>
        </div>
      </div>

      {isSettingsOpen ? (
        <button
          type="button"
          aria-label="Fermer les réglages"
          onClick={() => setIsSettingsOpen(false)}
          className="absolute inset-0 z-20 bg-slate-950/20 backdrop-blur-[1px]"
        />
      ) : null}

      <div
        aria-hidden={!isSettingsOpen}
        className={`absolute inset-y-0 right-0 z-30 flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/15 transition-all duration-300 ${
          isSettingsOpen
            ? "w-72 opacity-100"
            : "invisible w-0 opacity-0 pointer-events-none border-l-0"
        }`}
      >
        <div className="w-72 flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Réglages</h2>
              <p className="text-xs text-gray-500 mt-1">
                Contexte envoyé à Gemini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              aria-label="Fermer les réglages"
              className="rounded-lg px-2 py-1 text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              ×
            </button>
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
