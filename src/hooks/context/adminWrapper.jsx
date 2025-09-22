import React from "react";
import { CRUDProvider } from "./useCRUD";
import { adminService } from "../../services/adminService";

export const AdminsProvider = ({ children }) => {
  return <CRUDProvider services={adminService}>{children}</CRUDProvider>;
};
