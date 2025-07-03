import { GenericCRUDPage } from "../components/Screen/GenericCRUDPAge";
import { ClientsProvider } from "../hooks/context/clientWrapper";

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
    minWidth: 100,
    render: (row) => (row.active ? "Sí" : "No"),
  },
  {
    accessor: "createdAt",
    header: "Fecha de Creación",
    width: 180,
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

export function ClientsPage() {
  const handleAddClient = () => {
    console.log("Abrir modal para crear nuevo cliente...");
  };

  const handleSaveChanges = () => {
    console.log("Guardando cambios...");
  };

  return (
    <GenericCRUDPage
      columns={clientColumns}
      entityName="cliente"
      onAdd={handleAddClient}
      onSave={handleSaveChanges}
    />
  );
}

export default function ClientsWrapper() {
  return (
    <ClientsProvider>
      <ClientsPage />
    </ClientsProvider>
  );
}
