import { createContext, useContext, useState, type ReactNode } from "react";

export type RolVistaPrevia = "docente" | "estudiante" | null;

type VistaPreviaContextType = {
  activo: boolean;
  rol: RolVistaPrevia;
  activar: (rol: RolVistaPrevia) => void;
  salir: () => void;
};

const VistaPreviaContext = createContext<VistaPreviaContextType | undefined>(undefined);

export function VistaPreviaProvider({ children }: { children: ReactNode }) {
  const [activo, setActivo] = useState(false);
  const [rol, setRol] = useState<RolVistaPrevia>(null);

  const activar = (r: RolVistaPrevia) => {
    setRol(r);
    setActivo(true);
  };

  const salir = () => {
    setActivo(false);
    setRol(null);
  };

  return (
    <VistaPreviaContext.Provider value={{ activo, rol, activar, salir }}>
      {children}
    </VistaPreviaContext.Provider>
  );
}

export function useVistaPrevia() {
  const ctx = useContext(VistaPreviaContext);
  if (!ctx) throw new Error("useVistaPrevia debe usarse dentro de VistaPreviaProvider");
  return ctx;
}
