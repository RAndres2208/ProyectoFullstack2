import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import {
  rolDesdeRuta,
  rolPrincipal,
  useRoles,
  type RolSyncPass,
} from "./roles";

type PerfilActivoContextType = {
  roles: RolSyncPass[];
  rolActivo: RolSyncPass | null;
  seleccionarRol: (rol: RolSyncPass) => void;
  cargando: boolean;
};

const PerfilActivoContext = createContext<
  PerfilActivoContextType | undefined
>(undefined);

/**
 * Conserva el perfil visual elegido para usuarios con varios grupos de
 * Cognito. La selección solo cambia la navegación: cada ruta y la API
 * vuelven a comprobar los roles reales de la sesión.
 */
export function PerfilActivoProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { roles, cargando } = useRoles();
  const [location] = useLocation();
  const [seleccion, setSeleccion] = useState<RolSyncPass | null>(null);
  const rolRuta = rolDesdeRuta(location);

  const rolActivo = useMemo(() => {
    // La ruta manda cuando corresponde a un grupo real de la sesión.
    if (rolRuta && roles.includes(rolRuta)) {
      return rolRuta;
    }

    if (seleccion && roles.includes(seleccion)) {
      return seleccion;
    }

    return rolPrincipal(roles);
  }, [roles, seleccion, rolRuta]);

  const seleccionarRol = useCallback(
    (rol: RolSyncPass) => {
      if (roles.includes(rol)) {
        setSeleccion(rol);
      }
    },
    [roles]
  );

  return (
    <PerfilActivoContext.Provider
      value={{ roles, rolActivo, seleccionarRol, cargando }}
    >
      {children}
    </PerfilActivoContext.Provider>
  );
}

export function usePerfilActivo() {
  const ctx = useContext(PerfilActivoContext);

  if (!ctx) {
    throw new Error(
      "usePerfilActivo debe usarse dentro de PerfilActivoProvider"
    );
  }

  return ctx;
}
