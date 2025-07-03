import React, { useState } from "react";
import ClientCreateDialog from "../components/Dialog/ClientCreateDialog";
import { GenericCRUDPage } from "../components/Screen/GenericCRUDPAge";
import { ClientsProvider } from "../hooks/context/clientWrapper";
import { createNewClient } from "../services/clientService";
import { useCRUD } from "../hooks/context/useCRUD";
import { Alert, AlertTitle, Snackbar } from "@mui/material";

const clientColumns = [
  {
    accessor: "cod_client",
    header: "Código Cliente",
    width: 150,
  },
  {
    accessor: "razon_soci",
    header: "Razón Social",
    flex: 1,
    minWidth: 200,
  },
  {
    accessor: "identiftri",
    header: "Identificador Fiscal",
    minWidth: 180,
  },
  {
    accessor: "username",
    header: "Usuario",
    minWidth: 150,
  },
  {
    accessor: "active",
    header: "Activo",
    type: "boolean",
    minWidth: 100,
    align: "center",
  },
  {
    accessor: "createdAt",
    header: "Fecha de Creación",
    width: 180,
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

export function ClientsPage() {
  const { fetchItems } = useCRUD();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSnackOpen, setSnackOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleAddClient = () => {
    setCreateDialogOpen(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      console.log("Enviando datos para crear cliente:", clientData);
      await createNewClient(clientData);
      fetchItems();
    } catch (error) {
      console.error("Falló la creación del cliente desde la página", error);
      setError(error.message || "Ocurrió un error inesperado.");
      throw error;
    } finally {
      setSnackOpen(true);
      setError(false);
    }
  };

  const handleSaveChanges = () => {
    setCreateDialogOpen(false);
  };

  return (
    <React.Fragment>
      <GenericCRUDPage
        columns={clientColumns}
        entityName="cliente"
        onAdd={handleAddClient}
        onSave={handleSaveChanges}
      />
      <ClientCreateDialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleSaveClient}
      />

      <Snackbar
        open={isSnackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
      >
        <Alert
          severity={error ? "error" : "success"}
          onClose={() => setSnackOpen(false)}
        >
          <AlertTitle>
            {error ? "Ha ocurrido un error:" : "Usuario creado con éxito."}
          </AlertTitle>

          {error && error}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

export default function ClientsWrapper() {
  return (
    <ClientsProvider>
      <ClientsPage />
    </ClientsProvider>
  );
}
