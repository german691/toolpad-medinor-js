import React, { useState } from "react";
import ClientCreateDialog from "../components/Dialog/ClientCreateDialog";
import { GenericCRUDPage } from "../components/Screen/GenericCRUDPAge";
import { ClientsProvider } from "../hooks/context/clientWrapper";
import { createNewClient } from "../services/clientService";

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
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const handleAddClient = () => {
    setCreateDialogOpen(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      console.log("Enviando datos para crear cliente:", clientData);
      await createNewClient(clientData);
    } catch (error) {
      console.error("Falló la creación del cliente desde la página", error);
      throw error;
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
