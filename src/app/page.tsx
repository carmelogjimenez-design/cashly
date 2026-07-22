import Link from "next/link";
import Logo from "@/components/Logo";

export default function SplashPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-between px-6 py-12">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Logo size="lg" />

        <h1 className="mt-8 max-w-md font-display text-3xl font-bold leading-tight text-navy">
          Entiende tu dinero.
          <br />
          Mejora tu futuro.
        </h1>

        <p className="mt-4 max-w-sm text-lg font-semibold text-navy/80">
          Tu copiloto financiero. Sin palabras raras, sin juicios. Solo claridad
          sobre lo que ganas, gastas y puedes ahorrar.
        </p>

        {/* Tres promesas rápidas */}
        <div className="mt-10 grid w-full max-w-sm grid-cols-1 gap-3">
          {[
            "Sabes lo que ganas. Descubre dónde se va.",
            "Menos ansiedad. Más claridad.",
            "Cada euro tiene un trabajo.",
          ].map((frase) => (
            <div
              key={frase}
              className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-navy"
            >
              {frase}
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Link href="/registro" className="btn-primary w-full">
          Empezar gratis
        </Link>
        <Link href="/login" className="btn-secondary w-full">
          Ya tengo cuenta
        </Link>
        <p className="mt-2 text-center text-xs font-semibold text-navy/60">
          Cashly ofrece información y educación financiera. No sustituye el
          asesoramiento profesional.
        </p>
      </div>
    </main>
  );
}
