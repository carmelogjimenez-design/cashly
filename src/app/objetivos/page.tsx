import { Target } from "lucide-react";
import AppShell from "@/components/AppShell";
import Placeholder from "@/components/Placeholder";

export default function ObjetivosPage() {
  return (
    <AppShell>
      <Placeholder
        icon={Target}
        titulo="Objetivos"
        descripcion="Define metas realistas (un viaje, un coche, un colchón) y Cashly te dirá cuánto ahorrar al mes para llegar."
        fase="Llega en la Fase 3"
      />
    </AppShell>
  );
}
