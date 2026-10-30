import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type RolDemo = "docente" | "estudiante" | null;

type DemoRoleContextType = {
  rolDemo: RolDemo;
  setRolDemo: (rol: RolDemo) => void;
  esModoDemo: boolean;
  limpiarRolDemo: () => void;
};

const DemoRoleContext = createContext<DemoRoleContextType | undefined>(undefined);

const STORAGE_KEY = "syncpass.demo.role";

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const [rolDemo, setRolDemoState] = useState<RolDemo>(null);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(STORAGE_KEY);
      if (guardado === "docente" || guardado === "estudiante") {
        setRolDemoState(guardado);
      }
    } catch {
      // ignorar
    }
  }, []);

  const setRolDemo = (rol: RolDemo) => {
    setRolDemoState(rol);
    try {
      if (rol) {
        window.localStorage.setItem(STORAGE_KEY, rol);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignorar
    }
  };

  const limpiarRolDemo = () => {
    setRolDemo(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }
  };

  return (
    <DemoRoleContext.Provider value={{ rolDemo, setRolDemo, esModoDemo: rolDemo !== null, limpiarRolDemo }}>
      {children}
    </DemoRoleContext.Provider>
  );
}

export function useDemoRole() {
  const ctx = useContext(DemoRoleContext);
  if (!ctx) throw new Error("useDemoRole debe usarse dentro de DemoRoleProvider");
  return ctx;
}
