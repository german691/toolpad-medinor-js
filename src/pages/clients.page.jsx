import React, { useState } from "react";
import ClientCreateDialog from "../components/Dialog/ClientCreateDialog";
import { ClientsProvider } from "../hooks/context/clientWrapper";
import { bulkUpdateClients, createNewClient } from "../services/clientService";
import { useCRUD } from "../hooks/context/useCRUD";
import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { GenericCRUDPage } from "../components/Screen/GenericCRUDPage";
import { formatDate } from "../func/formatDate";

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
    editable: true,
  },
  {
    accessor: "identiftri",
    header: "Identificador Fiscal",
    minWidth: 180,
    editable: true,
  },
  {
    accessor: "username",
    header: "Usuario",
    minWidth: 150,
    editable: true,
  },
  {
    accessor: "level",
    header: "Nivel",
    minWidth: 80,
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
  {
    accessor: "createdAt",
    header: "F. Creación",
    width: 180,
    renderCell: ({ value, row }) => formatDate(value ?? row?.createdAt),
  },
];

export function ClientsPage() {
  const { fetchItems } = useCRUD();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSnackOpen, setSnackOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState({});
  const [selectedModel, setSelectedModel] = useState({
    type: "include",
    ids: new Set(),
  });

  const handleAddClient = () => {
    setCreateDialogOpen(true);
  };

  const handleSaveClient = async (clientData) => {
    let response = null;
    try {
      response = await createNewClient(clientData);
      setStatusMessage({
        title: "Usuario creado correctamente",
      });
      fetchItems();
    } catch (error) {
      setStatusMessage({
        title: "Ha ocurrido un problema: ",
        message: error.message,
        severity: "error",
      });
      throw error;
    } finally {
      setSnackOpen(true);
    }
  };

  const handleUpdateClient = async (clientData) => {
    let response;
    try {
      response = await bulkUpdateClients(clientData);
      if (response.status == 207) {
        setStatusMessage({
          title: "Precaución: ",
          message:
            response?.data?.message > 0
              ? `Se han actualizado ${response?.data?.message} registros`
              : "No se actualizaron registros",
          severity: "warning",
        });
      } else {
        response.data.updatedCount == 1
          ? setStatusMessage({
              title: "Cliente actualizado con éxito",
            })
          : setStatusMessage({
              title: "Clientes actualizados exitosamente",
              message: `Se actualizaron ${response?.data?.updatedCount} registros`,
            });
      }

      fetchItems();
    } catch (error) {
      setStatusMessage({
        title: "Ha ocurrido un problema: ",
        message: response?.data?.message || "Ocurrió un error inesperado.",
      });
      throw error;
    } finally {
      setSnackOpen(true);
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
        onUpdate={handleUpdateClient}
        selectionModel={selectedModel}
        onSelectionChange={(newModel) => setSelectedModel(newModel)}
        isClientPage={true}
      />
      <ClientCreateDialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleSaveClient}
      />

      <Snackbar
        open={isSnackOpen}
        autoHideDuration={6000}
        onClose={() => {
          setSnackOpen(false), setStatusMessage({});
        }}
      >
        <Alert
          severity={statusMessage.severity || "success"}
          onClose={() => {
            setSnackOpen(false);
            setStatusMessage({});
          }}
        >
          <AlertTitle>{statusMessage.title || "Éxito."}</AlertTitle>

          {statusMessage.message || ""}
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
