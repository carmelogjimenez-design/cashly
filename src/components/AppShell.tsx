"use client";

import BottomNav from "@/components/BottomNav";
import Toaster from "@/components/Toaster";

// Envoltorio de la zona privada: centra el contenido, anima la entrada
// y añade la barra inferior. La protección de sesión la hace el middleware.
export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <div className="stagger flex-1 px-5 pb-6 pt-8">{children}</div>
      <BottomNav />
      <Toaster />
    </div>
  );
}
