import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  TableSortLabel,
  Box,
} from "@mui/material";
import Loading from "../UI/Loading";

export const GenericTable = ({
  data,
  columns,
  loading,
  error,
  pagination,
  onPageChange,
  onLimitChange,
  sort,
  onSortChange,
}) => {
  const handleSortRequest = (accessor) => {
    if (!onSortChange) return;

    const isAsc = sort && sort.key === accessor && sort.direction === "asc";
    const direction = isAsc ? "desc" : "asc";
    onSortChange({ key: accessor, direction });
  };

  return (
    <Paper>
      {loading && Loading}
      <TableContainer sx={{ width: "100%" }}>
        <Table stickyHeader aria-label="generic table">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.accessor || col.header}
                  align={col.align || "left"}
                  sortDirection={
                    sort && sort.key === col.accessor ? sort.direction : false
                  }
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sort && sort.key === col.accessor}
                      direction={
                        sort && sort.key === col.accessor
                          ? sort.direction
                          : "asc"
                      }
                      onClick={() => handleSortRequest(col.accessor)}
                    >
                      {col.header}
                    </TableSortLabel>
                  ) : (
                    col.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography color="error">
                    Error:{" "}
                    {error.message || "Ocurrió un error al cargar los datos."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : !loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography>No se encontraron resultados.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {columns.map((col) => {
                    const value = col.render
                      ? col.render(row)
                      : row[col.accessor];
                    return (
                      <TableCell
                        key={col.accessor || col.header}
                        align={col.align || "left"}
                      >
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && onPageChange && onLimitChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total || 0}
          rowsPerPage={pagination.limit || 10}
          page={pagination.page - 1}
          onPageChange={(event, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={(event) =>
            onLimitChange(parseInt(event.target.value, 10))
          }
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
        />
      )}
    </Paper>
  );
};
