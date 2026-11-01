import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { RolSyncPass } from "./roles";

/**
 * Los roles de demostración solo permiten recorrer pantallas con datos
 * ficticios. Viven en memoria durante la sesión de la pestaña: nunca se
 * guardan en el navegador ni se usan para autorizar llamadas a la API.
 */
export type RolDemo = RolSyncPass | null;

type DemoRoleContextType = {
  rolDemo: RolDemo;
  setRolDemo: (rol: RolDemo) => void;
  esModoDemo: boolean;
  limpiarRolDemo: () => void;
};

const DemoRoleContext = createContext<DemoRoleContextType | undefined>(
  undefined
);

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const [rolDemo, setRolDemoState] = useState<RolDemo>(null);

  const setRolDemo = (rol: RolDemo) => {
    setRolDemoState(rol);
  };

  const limpiarRolDemo = () => {
    setRolDemoState(null);
  };

  return (
    <DemoRoleContext.Provider
      value={{
        rolDemo,
        setRolDemo,
        esModoDemo: rolDemo !== null,
        limpiarRolDemo,
      }}
    >
      {children}
    </DemoRoleContext.Provider>
  );
}

export function useDemoRole() {
  const ctx = useContext(DemoRoleContext);

  if (!ctx) {
    throw new Error("useDemoRole debe usarse dentro de DemoRoleProvider");
  }

  return ctx;
}
