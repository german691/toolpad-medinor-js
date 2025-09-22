import React from "react";
import { productService } from "../../services/productService";
import { CRUDProvider } from "./useCRUD";

export const ProductsProvider = ({ children, initialFilters }) => {
  return (
    <CRUDProvider services={productService} initialFilters={initialFilters}>
      {children}
    </CRUDProvider>
  );
};
