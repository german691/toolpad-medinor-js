import React, { useState, useEffect, useMemo } from "react";
import ProductCreateDialog from "../components/Dialog/ProductCreateDialog";
import {
  bulkUpdateProducts,
  createNewProduct,
} from "../services/productService";
import { useCRUD } from "../hooks/context/useCRUD";
import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { ProductsProvider } from "../hooks/context/productWrapper";
import getLabs from "../services/labService";
import getCategories from "../services/categoryService";
import ItemSelect from "../components/Select/ItemSelect";
import { GenericCRUDPage } from "../components/Screen/GenericCRUDPage";

export function ProductsPage() {
  const { fetchItems } = useCRUD();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSnackOpen, setSnackOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState({});
  const [labs, setLabs] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await getLabs();
        const formattedLabs = response.data.items.map((labObj) => ({
          value: labObj.lab,
          label: labObj.lab,
          key: labObj.lab,
        }));
        setLabs(formattedLabs);
      } catch (error) {
        console.error("Error al cargar los laboratorios:", error);
      }
    };
    fetchLabs();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const formattedCats = response.data.items.map((catObj) => ({
          value: catObj.category,
          label: catObj.category,
          key: catObj.category,
        }));

        setCategories(formattedCats);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  const productColumns = useMemo(
    () => [
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
        minWidth: 100,
        type: "singleSelect",
        valueOptions: labs,
        editable: true,
        renderEditCell: (params) => <ItemSelect {...params} options={labs} />,
        render: (params) => {
          const selectedOption = labs.find((opt) => opt.value === params.value);
          return selectedOption ? selectedOption.label : params.value;
        },
      },
      {
        accessor: "category",
        header: "Categorías",
        minWidth: 135,
        type: "singleSelect",
        valueOptions: categories,
        editable: true,
        renderEditCell: (params) => (
          <ItemSelect {...params} options={categories} />
        ),
        render: (params) => {
          const selectedOption = categories.find(
            (opt) => opt.value === params.value
          );
          return selectedOption ? selectedOption.label : params.value;
        },
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
        accessor: "level",
        header: "Nivel",
        minWidth: 150,
        editable: true,
      },
      // {
      //   accessor: "discount",
      //   header: "Descuento",
      //   minWidth: 100,
      // },
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
    ],
    [labs]
  );

  const handleAddProduct = () => {
    setCreateDialogOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    let response = null;
    try {
      response = await createNewProduct(productData);
      setStatusMessage({
        title: "Producto añadido correctamente",
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

  const handleUpdateClient = async (productData) => {
    let response;
    try {
      response = await bulkUpdateProducts(productData);
      if (response.status === 207) {
        setStatusMessage({
          title: "Precaución: ",
          message:
            response?.data?.message > 0
              ? `Se han actualizado ${response?.data?.message} registros`
              : "No se actualizaron registros",
          severity: "warning",
        });
      } else {
        response.data.updatedCount === 1
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
          setSnackOpen(false);
          setStatusMessage({});
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
