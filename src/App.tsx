import * as React from "react";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import type { Navigation } from "@toolpad/core/AppProvider";

import {
  ShoppingCart,
  Person,
  PeopleAlt,
  PersonAdd,
  History,
  ShoppingBasket,
  AddBox,
  Edit,
  LibraryAdd,
  Science,
  Sell,
  Image,
} from "@mui/icons-material";

const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Clientes",
  },
  {
    segment: "clients",
    title: "Clientes",
    icon: <Person />,
    children: [
      {
        segment: "migration",
        title: "Migración de Clientes",
        icon: <PeopleAlt />,
      },
      {
        segment: "crud",
        title: "Alta, Baja y Modificación",
        icon: <PersonAdd />,
      },
    ],
  },
  {
    kind: "header",
    title: "Productos",
  },
  {
    segment: "products",
    title: "Productos",
    icon: <AddBox />,
    children: [
      {
        segment: "migration",
        title: "Migración de Productos",
        icon: <LibraryAdd />,
      },
      {
        segment: "crud",
        title: "Gestión",
        icon: <Edit />,
      },

      {
        segment: "images",
        title: "Imágenes",
        icon: <Image />,
      },
    ],
  },
  {
    kind: "header",
    title: "Pedidos",
  },
  {
    segment: "orders",
    title: "Pedidos",
    icon: <ShoppingCart />,
    children: [
      {
        segment: "manage",
        title: "Lista de Pedidos",
        icon: <Sell />,
      },
      // {
      //   segment: "history",
      //   title: "Historial",
      //   icon: <History />,
      // },
    ],
  },
];

const BRANDING = {
  title: "Medinor",
};

export default function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}
