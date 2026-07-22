// Feedback físico: vibración (donde el dispositivo lo permita) y un
// "cling" de moneda sintetizado (sin archivos). El sonido es opt-in.

const KEY_SONIDO = "cashly-sonido";

export function sonidoActivado(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY_SONIDO) === "1";
}

export function setSonido(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_SONIDO, v ? "1" : "0");
}

export function haptic(patron: number | number[] = 12) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(patron);
    } catch {
      /* algunos navegadores lo bloquean, no pasa nada */
    }
  }
}

// Genera un pequeño sonido de moneda con Web Audio (dos notas ascendentes).
export function cling() {
  if (!sonidoActivado()) return;
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const notas = [988, 1319]; // Si5 -> Mi6
    notas.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      const t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    });
    setTimeout(() => ctx.close(), 600);
  } catch {
    /* Web Audio no disponible */
  }
}

// Celebración: vibración alegre + moneda.
export function celebrarFeedback() {
  haptic([12, 40, 12, 40, 20]);
  cling();
}

// Toque corto para acciones normales (guardar, etc.).
export function toque() {
  haptic(10);
}
