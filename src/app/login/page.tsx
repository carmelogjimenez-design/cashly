"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError("No hemos podido entrar. Revisa el correo y la contraseña.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <Logo size="md" />
        </Link>

        <h1 className="font-display text-3xl font-bold text-navy">
          Hola de nuevo
        </h1>
        <p className="mt-1 mb-8 font-semibold text-navy/70">
          Entra para ver cómo va tu dinero.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-navy px-4 py-3 text-sm font-bold text-white">
              {error}
            </div>
          )}

          <button
            className="btn-primary w-full"
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </div>

        <p className="mt-8 text-center font-semibold text-navy/70">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-bold text-navy underline">
            Créala gratis
          </Link>
        </p>
      </div>
    </main>
  );
}
