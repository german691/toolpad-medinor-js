import * as React from "react";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { AppProvider, type Navigation } from "@toolpad/core/AppProvider";
import {
  Person,
  PeopleAlt,
  PersonAdd,
  AddBox,
  Edit,
  LibraryAdd,
  Sell,
  Image,
  Group,
  Home,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCurrentUserRole } from "./features/authSlice";

// --- Navegación con metadato de roles (prop extra que Toolpad ignora) ---
const NAVIGATION_WITH_ROLES: Navigation & any = [
  { kind: "header", title: "Inicio" },
  {
    segment: "home",
    title: "Inicio",
    icon: <Home />,
    // sin roles -> visible para cualquiera autenticado
  },

  { kind: "header", title: "Clientes" },

  {
    segment: "clients/migration",
    title: "Migración de Clientes",
    icon: <PeopleAlt />,
    roles: ["superadmin"],
  },
  {
    segment: "clients/crud",
    title: "Gestión de Clientes",
    icon: <PersonAdd />,
    roles: ["admin", "superadmin"],
  },

  { kind: "header", title: "Productos" },

  {
    segment: "products/migration",
    title: "Migración de Productos",
    icon: <LibraryAdd />,
    roles: ["superadmin"],
  },
  {
    segment: "products/crud",
    title: "Gestión de Productos",
    icon: <Edit />,
    roles: ["admin", "superadmin"],
  },
  {
    segment: "products/images",
    title: "Cargar Imágenes",
    icon: <Image />,
    roles: ["images", "admin", "superadmin"],
  },

  { kind: "header", title: "Pedidos" },
  {
    segment: "orders/manage", // coincide con tu router
    title: "Lista de Pedidos",
    icon: <Sell />,
    roles: ["admin", "superadmin"],
  },

  { kind: "header", title: "Administradores" },
  {
    segment: "admins/manage",
    title: "Gestión de Administradores",
    icon: <Group />,
    roles: ["superadmin"],
  },
];

const BRANDING = { title: "Gestor Medinor" };

// --- Utilitario: filtra por rol y limpia headers vacíos ---
function filterNavigationByRole(nav: any[], role?: string | null): any[] {
  if (!role) return nav; // si aún no tenemos rol (p.ej. tras F5), no filtramos y ProtectedRoute valida

  const out: any[] = [];
  let pendingHeaderIndex: number | null = null;
  let hasItemsSinceHeader = false;

  const flushHeaderIfEmpty = () => {
    if (pendingHeaderIndex !== null && !hasItemsSinceHeader) {
      out.splice(pendingHeaderIndex, 1);
    }
    pendingHeaderIndex = null;
    hasItemsSinceHeader = false;
  };

  for (const item of nav) {
    if (item.kind === "header") {
      // cerramos el header previo si quedó vacío
      flushHeaderIfEmpty();
      out.push(item);
      pendingHeaderIndex = out.length - 1;
      hasItemsSinceHeader = false;
      continue;
    }

    // ítem con o sin children
    let include = true;
    let nextItem = item;

    if (item.children && Array.isArray(item.children)) {
      const filteredChildren = item.children.filter((child: any) => {
        if (!child.roles) return true;
        return child.roles.includes(role);
      });
      include = filteredChildren.length > 0 || !role;
      nextItem = { ...item, children: filteredChildren };
    } else {
      if (item.roles) include = item.roles.includes(role);
    }

    if (include) {
      out.push(nextItem);
      hasItemsSinceHeader = true;
    }
  }

  // último header
  flushHeaderIfEmpty();
  return out;
}

export default function App() {
  const role = useSelector(selectCurrentUserRole);

  const navigation = React.useMemo(
    () => filterNavigationByRole(NAVIGATION_WITH_ROLES, role),
    [role]
  );

  return (
    <AppProvider navigation={navigation as Navigation} branding={BRANDING}>
      <Outlet />
    </AppProvider>
  );
}
