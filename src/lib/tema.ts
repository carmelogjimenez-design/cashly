export type Tema = "claro" | "oscuro";

const KEY = "cashly-tema";

export function getTema(): Tema {
  if (typeof window === "undefined") return "claro";
  return (window.localStorage.getItem(KEY) as Tema) || "claro";
}

export function aplicarTema(t: Tema) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "oscuro");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", t === "oscuro" ? "#081733" : "#16C7E8");
  window.localStorage.setItem(KEY, t);
}
