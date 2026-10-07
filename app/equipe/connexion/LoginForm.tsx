"use client";

import { useState, type FormEvent } from "react";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/equipe/connexion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "La connexion a échoué.");
        return;
      }
      window.location.assign(returnTo);
    } catch {
      setMessage("La connexion a échoué. Vérifiez votre connexion puis réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="team-login__form" onSubmit={submit}>
      <label>Adresse e-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label>
      <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
      {message ? <p role="alert">{message}</p> : null}
      <button type="submit" disabled={submitting}>{submitting ? "Connexion…" : "Accéder à l’administration"}</button>
      <small>Accès strictement réservé aux membres autorisés de l’équipe Multiproduit Mali.</small>
    </form>
  );
}
