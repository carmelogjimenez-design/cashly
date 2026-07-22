import { Wallet } from "lucide-react";
import AppShell from "@/components/AppShell";
import Placeholder from "@/components/Placeholder";

export default function PresupuestoPage() {
  return (
    <AppShell>
      <Placeholder
        icon={Wallet}
        titulo="Presupuesto"
        descripcion="Un presupuesto que se adapta a tu realidad: lo que sueles gastar, lo que podrías gastar y el ahorro que ganarías."
        fase="Llega en la Fase 2"
      />
    </AppShell>
  );
}
