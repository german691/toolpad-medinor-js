import * as React from "react";
import { Outlet } from "react-router";
import { type Navigation } from "@toolpad/core/AppProvider";
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import {
  IconBasketDollar,
  IconHome,
  IconPackage,
  IconPhotoUp,
  IconShieldCog,
  IconTableImport,
  IconUserEdit,
  IconUserUp,
} from "@tabler/icons-react";

import { useSelector } from "react-redux";
import { selectCurrentUserRole } from "./features/authSlice";

const NAVIGATION_WITH_ROLES: Navigation & any = [
  { kind: "header", title: "Inicio" },
  {
    segment: "home",
    title: "Inicio",
    icon: <IconHome />,
  },

  { kind: "header", title: "Clientes" },

  {
    segment: "clients/migration",
    title: "Migración de Clientes",
    icon: <IconUserUp />,
    roles: ["superadmin"],
  },
  {
    segment: "clients/crud",
    title: "Gestión de Clientes",
    icon: <IconUserEdit />,
    roles: ["admin", "superadmin"],
  },

  { kind: "header", title: "Productos" },

  {
    segment: "products/migration",
    title: "Migración de Productos",
    icon: <IconTableImport />,
    roles: ["superadmin"],
  },
  {
    segment: "products/crud",
    title: "Gestión de Productos",
    icon: <IconPackage />,
    roles: ["admin", "superadmin"],
  },
  {
    segment: "products/images",
    title: "Cargar Imágenes",
    icon: <IconPhotoUp />,
    roles: ["images", "admin", "superadmin"],
  },

  { kind: "header", title: "Pedidos" },
  {
    segment: "orders/manage",
    title: "Lista de Pedidos",
    icon: <IconBasketDollar />,
    roles: ["admin", "superadmin"],
  },

  { kind: "header", title: "Administradores" },
  {
    segment: "admins/manage",
    title: "Gestión de Administradores",
    icon: <IconShieldCog />,
    roles: ["superadmin"],
  },
];

const BRANDING = { title: "Medinor - Gestión", logo: "" };

function filterNavigationByRole(nav: any[], role?: string | null): any[] {
  if (!role) return nav;

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
      flushHeaderIfEmpty();
      out.push(item);
      pendingHeaderIndex = out.length - 1;
      hasItemsSinceHeader = false;
      continue;
    }

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
    <ReactRouterAppProvider navigation={navigation as Navigation} branding={BRANDING}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}
