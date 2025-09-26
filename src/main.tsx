import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import App from "./App";
import Layout from "./layouts/dashboard";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../theme";
import clientsWrapper from "./pages/clients.page";
import ProductsWrapper from "./pages/products.page";
import ClientMigrationPage from "./pages/clientsMigration.page";
import ProductMigrationPage from "./pages/productsMigration.page";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/login.page";
import { Provider } from "react-redux";
import { store } from "./store";
import UnauthorizedPage from "./pages/unaoutorized.page";
import NotFoundPage from "./pages/notfound.page";
import ProductsImageWrapper from "./pages/images.page";
import OrdersPageWrapper from "./pages/orders.page";
import OrderDetailsPage from "./pages/orderDetails.page";
import AdminsPageWrapper from "./pages/admins.page";
import HomePage from "./pages/home.page";

const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={["superadmin", "admin", "images"]} />,
        children: [
          {
            element: <Layout />,
            children: [
              { index: true, element: <Navigate to="home" replace /> },
              { path: "home", element: <HomePage /> },

              // superadmin y admin
              {
                path: "clients/crud",
                element: <ProtectedRoute allowedRoles={["superadmin", "admin"]} />,
                children: [{ index: true, Component: clientsWrapper }],
              },
              {
                path: "products/crud",
                element: <ProtectedRoute allowedRoles={["superadmin", "admin"]} />,
                children: [{ index: true, Component: ProductsWrapper }],
              },
              {
                path: "orders/manage",
                element: <ProtectedRoute allowedRoles={["superadmin", "admin"]} />,
                children: [{ index: true, Component: OrdersPageWrapper }],
              },
              {
                path: "orders/manage/:orderId",
                element: <ProtectedRoute allowedRoles={["superadmin", "admin"]} />,
                children: [{ index: true, Component: OrderDetailsPage }],
              },

              // superadmin
              {
                path: "clients/migration",
                element: <ProtectedRoute allowedRoles={["superadmin"]} />,
                children: [{ index: true, Component: ClientMigrationPage }],
              },
              {
                path: "products/migration",
                element: <ProtectedRoute allowedRoles={["superadmin"]} />,
                children: [{ index: true, Component: ProductMigrationPage }],
              },
              {
                path: "admins/manage",
                element: <ProtectedRoute allowedRoles={["superadmin"]} />,
                children: [{ index: true, Component: AdminsPageWrapper }],
              },

              // images
              {
                path: "products/images",
                element: <ProtectedRoute allowedRoles={["superadmin", "admin", "images"]} />,
                children: [{ index: true, Component: ProductsImageWrapper }],
              },
            ],
          },
        ],
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </Provider>
);
