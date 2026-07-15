"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";
import {
  ApiError,
  ContentItem,
  ContentStatus,
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

const contentStatusOptions: Array<{ id: ContentStatus; label: string }> = [
  { id: "DRAFT", label: "Brouillon" },
  { id: "IN_REVIEW", label: "En relecture" },
  { id: "SCHEDULED", label: "Planifié" },
  { id: "PUBLISHED", label: "Publié" },
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
  const [publicationDate, setPublicationDate] = useState("");
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [isUpdatingWorkflow, setIsUpdatingWorkflow] = useState(false);
  const [workflowNotice, setWorkflowNotice] = useState<string | null>(null);
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
        setPublicationDate(content.publicationDate?.slice(0, 10) ?? "");
        setIsPlanningOpen(false);

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
        setPublicationDate(savedContent.publicationDate?.slice(0, 10) ?? "");
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

  async function updateWorkflow(status: ContentStatus) {
    if (!activeContent || isUpdatingWorkflow) return;

    if (status === "SCHEDULED" && !publicationDate) {
      setError("Choisissez une date avant de planifier ce contenu.");
      return;
    }

    setError(null);
    setWorkflowNotice(null);
    setIsUpdatingWorkflow(true);

    try {
      const agency = currentAgency ?? (await getCurrentAgency());
      const updatedContent = await updateContentItem(agency.agency.id, activeContent.id, {
        status,
        publicationDate:
          status === "SCHEDULED"
            ? new Date(`${publicationDate}T12:00:00`).toISOString()
            : activeContent.publicationDate ?? null,
      });
      setActiveContent(updatedContent);
      setPublicationDate(updatedContent.publicationDate?.slice(0, 10) ?? "");
      if (status === "SCHEDULED") setIsPlanningOpen(false);
      setWorkflowNotice(
        status === "IN_REVIEW"
          ? "Contenu envoyé en relecture."
          : status === "SCHEDULED"
            ? "Publication planifiée."
            : status === "PUBLISHED"
              ? "Contenu marqué comme publié."
              : "Contenu remis en brouillon.",
      );
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsUpdatingWorkflow(false);
    }
  }

  return (
    <div className="relative flex h-full min-h-[calc(100dvh-4rem)] w-full overflow-hidden bg-white text-gray-800 md:min-h-0">
      <div className="flex-1 flex flex-col bg-white h-full transition-all duration-300">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/contenu-ia.png"
              alt=""
              width={18}
              height={18}
              className="opacity-90"
            />
            <div>
              <h1 className="font-bold text-gray-900 text-lg">
                {activeContent?.title || "Rédaction IA"}
              </h1>
              <p className="text-xs text-gray-500">
                {activeContent ? "Brouillon enregistré automatiquement" : "Assistant Gemini"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeContent ? (
              <>
                <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 sm:inline-flex">
                  {contentStatusOptions.find((option) => option.id === activeContent.status)?.label ?? activeContent.status}
                </span>
                <Link
                  href="/contenus"
                  className="hidden rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"
                >
                  Voir mes contenus
                </Link>
              </>
            ) : null}
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

        {workflowNotice ? (
          <div className="mx-4 mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 sm:mx-8">
            {workflowNotice}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto space-y-6 px-4 py-6 sm:px-8 lg:px-16 lg:py-8">
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
                className={`border rounded-lg p-5 relative max-w-3xl ${
                  message.sender === "user"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                {message.sender === "ai" ? (
                  <MarkdownContent className="text-gray-900">
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

        {activeContent ? (
          <div className="border-t border-slate-200/80 bg-slate-50/90 px-4 py-3 backdrop-blur sm:px-8">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2.5">
              <span className="mr-1 text-xs font-bold uppercase tracking-wide text-slate-500">Finaliser</span>
              {isPlanningOpen ? (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  Date
                  <input
                    type="date"
                    value={publicationDate}
                    onChange={(event) => setPublicationDate(event.target.value)}
                    disabled={isUpdatingWorkflow}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                  />
                </label>
              ) : null}
              {isPlanningOpen ? (
                <>
                  <button type="button" onClick={() => void updateWorkflow("SCHEDULED")} disabled={isUpdatingWorkflow} className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">Confirmer la planification</button>
                  <button type="button" onClick={() => { setPublicationDate(activeContent.publicationDate?.slice(0, 10) ?? ""); setIsPlanningOpen(false); }} disabled={isUpdatingWorkflow} className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50">Annuler</button>
                </>
              ) : activeContent.status !== "PUBLISHED" ? (
                <button type="button" onClick={() => { setPublicationDate(activeContent.publicationDate?.slice(0, 10) ?? ""); setError(null); setWorkflowNotice(null); setIsPlanningOpen(true); }} disabled={isUpdatingWorkflow} className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">{activeContent.status === "SCHEDULED" ? "Modifier la planification" : "Planifier"}</button>
              ) : null}
              {activeContent.status !== "IN_REVIEW" && activeContent.status !== "PUBLISHED" ? (
                <button type="button" onClick={() => void updateWorkflow("IN_REVIEW")} disabled={isUpdatingWorkflow} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50">Envoyer en relecture</button>
              ) : null}
              {activeContent.status !== "PUBLISHED" ? (
                <button type="button" onClick={() => void updateWorkflow("PUBLISHED")} disabled={isUpdatingWorkflow} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">Marquer comme publié</button>
              ) : null}
              {activeContent.status !== "DRAFT" ? (
                <button type="button" onClick={() => void updateWorkflow("DRAFT")} disabled={isUpdatingWorkflow} className="ml-auto rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50">Repasser en brouillon</button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="border-t border-gray-100 bg-white p-4 sm:p-6">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex gap-3 items-center"
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

      {isSettingsOpen ? (
        <button
          type="button"
          aria-label="Fermer les réglages"
          onClick={() => setIsSettingsOpen(false)}
          className="absolute inset-0 z-20 bg-black/10"
        />
      ) : null}

      <div
        aria-hidden={!isSettingsOpen}
        className={`absolute inset-y-0 right-0 z-30 flex h-full flex-col border-l border-gray-200 bg-white shadow-xl transition-all duration-300 ${
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
