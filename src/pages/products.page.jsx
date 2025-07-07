import React, { useState } from "react";
import ProductCreateDialog from "../components/Dialog/ProductCreateDialog";
import {
  bulkUpdateProducts,
  createNewProduct,
} from "../services/productService";
import { useCRUD } from "../hooks/context/useCRUD";
import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { ProductsProvider } from "../hooks/context/productWrapper";
import { GenericCRUDPage } from "../components/Screen/GenericCRUDPAge";

const productColumns = [
  {
    accessor: "code",
    header: "Código",
    width: 120,
  },
  {
    accessor: "desc",
    header: "Descripción",
    flex: 1,
    minWidth: 225,
    editable: true,
  },
  {
    accessor: "extra_desc",
    header: "Descripción Adicional",
    minWidth: 200,
    editable: true,
  },
  {
    accessor: "lab",
    header: "Laboratorio",
    minWidth: 200,
    editable: true,
  },
  {
    accessor: "notes",
    header: "Notas",
    minWidth: 150,
    editable: true,
  },
  {
    accessor: "medinor_price",
    header: "P. Medinor",
    minWidth: 100,
    editable: true,
  },
  {
    accessor: "public_price",
    header: "P. Público",
    minWidth: 100,
    editable: true,
  },
  {
    accessor: "price",
    header: "P. Costo",
    minWidth: 100,
    editable: true,
  },
  {
    accessor: "iva",
    header: "IVA",
    type: "boolean",
    width: 60,
    align: "center",
    editable: true,
  },
  {
    accessor: "listed",
    header: "Visible",
    type: "boolean",
    minWidth: 60,
    align: "center",
    editable: true,
  },
  {
    accessor: "createdAt",
    header: "F. Creación",
    width: 100,
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

export function ProductsPage() {
  const { fetchItems } = useCRUD();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSnackOpen, setSnackOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState({});

  const handleAddProduct = () => {
    setCreateDialogOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    let response = null;
    console.log("lo que llega a la pag", productData);
    try {
      response = await createNewProduct(productData);
      setStatusMessage({
        title: "Producto añadido correctamente",
      });
      fetchItems();
    } catch (error) {
      console.log(response);

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

  const handleUpdateClient = async (productData) => {
    let response;
    try {
      response = await bulkUpdateProducts(productData);
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
        console.log(response.data.updatedCount, response);
        response.data.updatedCount == 1
          ? setStatusMessage({
              title: "Producto actualizado con éxito",
            })
          : setStatusMessage({
              title: "Productos actualizados exitosamente",
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
        columns={productColumns}
        entityName="producto"
        onAdd={handleAddProduct}
        onSave={handleSaveChanges}
        onUpdate={handleUpdateClient}
      />
      <ProductCreateDialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleSaveProduct}
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

export default function ProductsWrapper() {
  return (
    <ProductsProvider>
      <ProductsPage />
    </ProductsProvider>
  );
}
