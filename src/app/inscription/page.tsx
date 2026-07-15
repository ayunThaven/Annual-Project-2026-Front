"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, register } from "@/lib/api";
import AuthShell from "@/components/ui/AuthShell";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

function getRedirectPath() {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/parametres?onboarding=1";
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.status === 409 ? "Cet email est déjà utilisé." : error.message;
  return "Impossible de créer le compte pour le moment.";
}

export default function InscriptionPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await register({ email, password, displayName: displayName.trim() || undefined });
      router.push(getRedirectPath());
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Créer votre studio" description="Commencez par votre compte, puis invitez votre équipe lorsque vous êtes prêt.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <TextField label="Nom affiché" type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" placeholder="Camille Martin" />
        <TextField label="Adresse email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        <TextField label="Mot de passe" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} hint="Au moins 8 caractères." required />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création…" : "Créer mon espace"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Déjà inscrit ? <Link href="/connexion" className="font-bold text-indigo-600 hover:text-indigo-700">Se connecter</Link>
      </p>
    </AuthShell>
  );
}
