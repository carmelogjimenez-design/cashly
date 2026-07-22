"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError(null);
    setAviso(null);

    if (password.length < 6) {
      setError("La contraseña necesita al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });
    setLoading(false);

    if (error) {
      setError("No hemos podido crear la cuenta. Prueba con otro correo.");
      return;
    }

    // Si Supabase requiere confirmación por correo, no habrá sesión todavía.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setAviso(
        "Cuenta creada. Revisa tu correo para confirmarla y luego entra."
      );
    }
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <Logo size="md" />
        </Link>

        <h1 className="font-display text-3xl font-bold text-navy">
          Vamos a conocerte
        </h1>
        <p className="mt-1 mb-8 font-semibold text-navy/70">
          No hace falta que tengas todos los números perfectos.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="nombre">
              ¿Cómo te llamas?
            </label>
            <input
              id="nombre"
              type="text"
              autoComplete="given-name"
              className="field"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

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
              autoComplete="new-password"
              className="field"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-navy px-4 py-3 text-sm font-bold text-white">
              {error}
            </div>
          )}
          {aviso && (
            <div className="rounded-2xl bg-yellow px-4 py-3 text-sm font-bold text-navy">
              {aviso}
            </div>
          )}

          <button
            className="btn-primary w-full"
            onClick={handleSignup}
            disabled={loading || !email || !password}
          >
            {loading ? "Creando…" : "Crear mi cuenta"}
          </button>
        </div>

        <p className="mt-8 text-center font-semibold text-navy/70">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-bold text-navy underline">
            Entra aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
