"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, login } from "@/lib/api";
import AuthShell from "@/components/ui/AuthShell";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

function getRedirectPath() {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/parametres";
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.status === 401 ? "Email ou mot de passe incorrect." : error.message;
  return "Impossible de se connecter pour le moment.";
}

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      router.push(getRedirectPath());
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Bon retour parmi nous" description="Connectez-vous pour retrouver le pilotage éditorial de votre agence.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <TextField label="Adresse email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        <TextField label="Mot de passe" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Connexion…" : "Accéder à mon espace"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ? <Link href="/inscription" className="font-bold text-indigo-600 hover:text-indigo-700">Créer un compte</Link>
      </p>
    </AuthShell>
  );
}
