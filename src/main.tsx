import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import Layout from "./layouts/dashboard";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../theme";
import clientsWrapper from "./pages/clients.page";
import ProductsWrapper from "./pages/products.page";
import LabsPage from "./pages/labs.page";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            path: "clients/crud",
            Component: clientsWrapper,
          },
          {
            path: "products/crud",
            Component: ProductsWrapper,
          },
          {
            path: "products/labs",
            Component: LabsPage,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
