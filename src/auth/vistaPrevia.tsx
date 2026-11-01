import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { RolSyncPass } from "./roles";

/**
 * Vista previa aislada para revisar las pantallas de cada perfil. No cambia
 * los grupos de Cognito, no emite tokens y no habilita operaciones reales.
 */
export type RolVistaPrevia = RolSyncPass | null;

type VistaPreviaContextType = {
  activo: boolean;
  rol: RolVistaPrevia;
  activar: (rol: RolSyncPass) => void;
  salir: () => void;
};

const VistaPreviaContext = createContext<
  VistaPreviaContextType | undefined
>(undefined);

export function VistaPreviaProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activo, setActivo] = useState(false);
  const [rol, setRol] = useState<RolVistaPrevia>(null);

  const activar = (nuevoRol: RolSyncPass) => {
    setRol(nuevoRol);
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

  if (!ctx) {
    throw new Error(
      "useVistaPrevia debe usarse dentro de VistaPreviaProvider"
    );
  }

  return ctx;
}
