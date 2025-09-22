import React, { useState } from "react";
import { useCRUD } from "../hooks/context/useCRUD";
import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { GenericCRUDPage } from "../components/Screen/GenericCRUDPage";
import { bulkUpdateAdmins, createNewAdmin } from "../services/adminService";
import AdminCreateDialog from "../components/Dialog/AdminCreateDialog";
import { AdminsProvider } from "../hooks/context/adminWrapper";

const adminColumns = [
  {
    accessor: "username",
    header: "Nombre de Usuario",
    flex: 1,
    editable: true,
  },
  {
    accessor: "fullName",
    header: "Nombre de pila",
    flex: 1,
    editable: true,
  },
  {
    accessor: "role",
    header: "Rol",
    flex: 1,
    editable: true,
  },
  {
    accessor: "active",
    header: "Activo",
    type: "boolean",
    minWidth: 100,
    align: "center",
    editable: true,
  },
];

export function AdminsPage() {
  const { fetchItems } = useCRUD();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState({
    type: "include",
    ids: new Set(),
  });

  const handleAddAdmin = () => {
    setCreateDialogOpen(true);
  };

  const handleSaveAdmin = async (adminData) => {
    try {
      console.log("creating", adminData);
      const response = await createNewAdmin(adminData);
      console.log(response);
      fetchItems();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateClient = async (adminData) => {
    let response;
    try {
      response = await bulkUpdateAdmins(adminData);
      fetchItems();
    } catch (error) {
      throw error;
    }
  };

  const handleSaveChanges = () => {
    setCreateDialogOpen(false);
  };

  return (
    <React.Fragment>
      <GenericCRUDPage
        columns={adminColumns}
        entityName="admin"
        onAdd={handleAddAdmin}
        onSave={handleSaveChanges}
        onUpdate={handleUpdateClient}
        selectionModel={selectedModel}
        onSelectionChange={(newModel) => setSelectedModel(newModel)}
      />
      <AdminCreateDialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleSaveAdmin}
      />
    </React.Fragment>
  );
}

export default function ClientsWrapper() {
  return (
    <AdminsProvider>
      <AdminsPage />
    </AdminsProvider>
  );
}
