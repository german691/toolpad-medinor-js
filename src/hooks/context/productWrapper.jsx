import React from "react";
import { productService } from "../../services/productService";
import { CRUDProvider } from "./useCRUD";

export const ProductsProvider = ({ children }) => {
  return <CRUDProvider services={productService}>{children}</CRUDProvider>;
};
