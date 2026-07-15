"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";
import Modal from "@/components/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import TextField from "@/components/ui/TextField";
import {
  acceptContentIdea,
  ApiError,
  ContentIdea,
  CurrentAgency,
  generateContentIdeas,
  getCurrentAgency,
  listContentIdeas,
  updateContentIdea,
} from "@/lib/api";

type IdeaCount = 3 | 5 | 10;

const duplicateMeta = {
  UNIQUE: { label: "Unique", tone: "success" as const },
  POSSIBLE_DUPLICATE: { label: "À comparer", tone: "warning" as const },
  DUPLICATE: { label: "Doublon probable", tone: "danger" as const },
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Vous devez être connecté.";
    if (error.status === 404) return "Aucune agence active.";
    if (error.status === 400 && error.message.includes("not configured")) return "Le fournisseur IA n’est pas encore configuré.";
    return error.message;
  }
  return "Une erreur est survenue pendant le chargement des idées.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function mergeIdeas(currentIdeas: ContentIdea[], nextIdeas: ContentIdea[]) {
  const byId = new Map<string, ContentIdea>();
  [...nextIdeas, ...currentIdeas].forEach((idea) => byId.set(idea.id, idea));
  return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function IdeesPage() {
  const router = useRouter();
  const [currentAgency, setCurrentAgency] = useState<CurrentAgency | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState("");
  const [sector, setSector] = useState("");
  const [count, setCount] = useState<IdeaCount>(3);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: ideas.length,
    newIdeas: ideas.filter((idea) => idea.status === "NEW").length,
    scheduled: ideas.filter((idea) => idea.source === "SCHEDULED").length,
  }), [ideas]);

  async function loadIdeas() {
    setIsLoading(true);
    setError(null);
    try {
      const agency = await getCurrentAgency();
      setCurrentAgency(agency);
      setIdeas(await listContentIdeas(agency.agency.id));
    } catch (caughtError) {
      setCurrentAgency(null);
      setIdeas([]);
      setError(getErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadIdeas(); }, []);
  useEffect(() => {
    if (currentAgency && new URLSearchParams(window.location.search).get("generate") === "1") setIsGenerateModalOpen(true);
  }, [currentAgency]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentAgency || !theme.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateContentIdeas(currentAgency.agency.id, { theme, sector: sector.trim() || undefined, count, checkDuplicates });
      setIdeas((current) => mergeIdeas(current, result.ideas));
      setTheme("");
      setSector("");
      setCount(3);
      setCheckDuplicates(true);
      setIsGenerateModalOpen(false);
      setSuccess(`${result.ideas.length} idées viennent d’être ajoutées à votre inbox.`);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAccept(idea: ContentIdea) {
    if (!currentAgency || idea.status !== "NEW") return;
    setAcceptingId(idea.id);
    setError(null);
    try {
      const updatedIdea = await acceptContentIdea(currentAgency.agency.id, idea.id);
      setIdeas((current) => current.map((item) => item.id === updatedIdea.id ? updatedIdea : item));
      if (updatedIdea.acceptedContent?.id) router.push(`/redaction?contentId=${updatedIdea.acceptedContent.id}`);
      else setSuccess("Idée ajoutée à vos contenus.");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleDismiss(idea: ContentIdea) {
    if (!currentAgency || idea.status !== "NEW") return;
    setDismissingId(idea.id);
    setError(null);
    try {
      const updatedIdea = await updateContentIdea(currentAgency.agency.id, idea.id, { status: "DISMISSED" });
      setIdeas((current) => current.map((item) => item.id === updatedIdea.id ? updatedIdea : item));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setDismissingId(null);
    }
  }

  return (
    <div className="min-h-full">
      <PageHeader
        eyebrow="Idéation assistée"
        title="Votre inbox d’opportunités"
        description="Générez des sujets, évaluez leur potentiel et transformez les meilleurs en briefs actionnables."
        actions={<Button onClick={() => setIsGenerateModalOpen(true)} disabled={!currentAgency}>✦ Générer des idées</Button>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard value={stats.total} label="Idées en mémoire" detail="Toutes les propositions reçues" />
          <StatCard value={stats.newIdeas} label="À décider" detail="En attente de votre validation" />
          <StatCard value={stats.scheduled} label="Automatiques" detail="Issues de votre cadence" />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-8 sm:py-8">
        {isLoading ? <div className="grid gap-5 lg:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />)}</div> : null}
        {error ? <Card className="border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}{error === "Aucune agence active." ? <Link href="/parametres" className="ml-2 font-bold underline">Configurer l’agence</Link> : null}</Card> : null}
        {success ? <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{success}</Card> : null}

        {!isLoading && currentAgency && !ideas.length ? <EmptyState icon="✦" title="Votre prochaine idée commence ici" description="Décrivez un thème, un secteur ou une actualité : l’IA préparera des angles à prioriser." action={<Button onClick={() => setIsGenerateModalOpen(true)}>Générer des idées</Button>} /> : null}

        {!isLoading && ideas.length ? <div className="grid gap-5 xl:grid-cols-2">
          {ideas.map((idea) => {
            const duplicate = duplicateMeta[idea.duplicateStatus];
            const isNew = idea.status === "NEW";
            return <Card key={idea.id} className={`flex min-h-72 flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${idea.status === "DISMISSED" ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2"><Badge tone={idea.source === "SCHEDULED" ? "indigo" : "neutral"}>{idea.source === "SCHEDULED" ? "Automatique" : "Manuelle"}</Badge><Badge tone={duplicate.tone}>{duplicate.label}</Badge></div>
                <span className="shrink-0 text-[11px] font-medium text-slate-400">{formatDate(idea.createdAt)}</span>
              </div>
              <div className="mt-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">{idea.contentType || "Contenu"}</p><h2 className="mt-2 text-lg font-extrabold leading-snug tracking-tight text-slate-950">{idea.title}</h2><p className="mt-2 text-sm font-medium text-slate-600">{idea.angle || idea.searchIntent || "Angle à préciser"}</p></div>
              {idea.rationale ? <div className="mt-4 line-clamp-4 text-sm leading-6 text-slate-500"><MarkdownContent>{idea.rationale}</MarkdownContent></div> : null}
              {idea.keywords?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{idea.keywords.slice(0, 6).map((keyword) => <span key={keyword} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{keyword}</span>)}</div> : null}
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5"><Badge tone={idea.status === "ACCEPTED" ? "success" : idea.status === "DISMISSED" ? "neutral" : "warning"}>{idea.status === "ACCEPTED" ? "Ajoutée au calendrier" : idea.status === "DISMISSED" ? "Ignorée" : "À valider"}</Badge>{isNew ? <div className="flex gap-2"><Button variant="quiet" onClick={() => void handleDismiss(idea)} disabled={dismissingId === idea.id}>{dismissingId === idea.id ? "…" : "Ignorer"}</Button><Button onClick={() => void handleAccept(idea)} disabled={acceptingId === idea.id}>{acceptingId === idea.id ? "Préparation…" : "Préparer"} <span>→</span></Button></div> : idea.acceptedContent ? <Link href={`/redaction?contentId=${idea.acceptedContent.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Ouvrir la rédaction →</Link> : null}</div>
            </Card>;
          })}
        </div> : null}
      </div>

      <Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Générer de nouvelles idées" description="Cadrez la recherche, puis validez chaque proposition dans votre inbox.">
        <form onSubmit={handleGenerate} className="space-y-5">
          <TextField label="Thème à explorer" value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="Ex. La productivité des équipes commerciales" required autoFocus />
          <TextField label="Secteur ou contexte" value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Ex. SaaS B2B, immobilier, santé…" />
          <div><p className="text-xs font-bold text-slate-700">Nombre de propositions</p><div className="mt-2 grid grid-cols-3 gap-2">{([3, 5, 10] as IdeaCount[]).map((value) => <button key={value} type="button" onClick={() => setCount(value)} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${count === value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{value} idées</button>)}</div></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3.5"><input type="checkbox" checked={checkDuplicates} onChange={(event) => setCheckDuplicates(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /><span><span className="block text-sm font-bold text-slate-700">Vérifier les doublons</span><span className="mt-1 block text-xs leading-5 text-slate-500">Comparer les propositions avec les sujets déjà existants.</span></span></label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5"><Button variant="quiet" onClick={() => setIsGenerateModalOpen(false)}>Annuler</Button><Button type="submit" disabled={!theme.trim() || isGenerating}>{isGenerating ? "Génération…" : "Lancer la génération"}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
