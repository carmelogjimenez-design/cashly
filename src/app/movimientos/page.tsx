import { ArrowLeftRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import Placeholder from "@/components/Placeholder";

export default function MovimientosPage() {
  return (
    <AppShell>
      <Placeholder
        icon={ArrowLeftRight}
        titulo="Movimientos"
        descripcion="Aquí verás cada ingreso y gasto, clasificado automáticamente, con búsqueda y filtros."
        fase="Llega en la Fase 2"
      />
    </AppShell>
  );
}
