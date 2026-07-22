// Lanza confeti con los colores de Cashly. Carga la librería solo en el
// navegador y solo cuando se usa, para no afectar al arranque.
export async function celebra() {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#FFE500", "#16C7E8", "#071A3A", "#ffffff"];
  confetti({ particleCount: 90, spread: 65, origin: { y: 0.7 }, colors });
  setTimeout(
    () =>
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      }),
    150
  );
  setTimeout(
    () =>
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      }),
    150
  );
}
