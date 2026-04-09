"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  initialError: string | null;
  redirectTo: string;
};

export function AdminLoginForm({ initialError, redirectTo }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password
      })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setSubmitting(false);
      setError(payload.error ?? "Unable to log in.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-8">
      <div>
        <label htmlFor="username" className="text-sm font-medium text-slate-600">
          Username
        </label>
        <input
          id="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-slate-600">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ink"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Open Admin Dashboard"}
      </button>
      <Link href="/" className="block text-sm text-slate-500 underline-offset-4 hover:underline">
        Back to home
      </Link>
    </form>
  );
}
