"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, Wallet, Target, User } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/presupuesto", label: "Presupuesto", icon: Wallet },
  { href: "/objetivos", label: "Objetivos", icon: Target },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-30 border-t border-navy/5 bg-white/90 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-colors ${
                  active ? "text-navy" : "text-slate/70"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-1 w-8 rounded-full bg-yellow" />
                )}
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200 ${
                    active
                      ? "scale-105 bg-yellow shadow-[0_4px_12px_-2px_rgba(255,229,0,0.7)]"
                      : "scale-100 bg-transparent"
                  }`}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
