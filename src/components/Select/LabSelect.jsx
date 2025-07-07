import React from "react";
import { FormControl, Autocomplete, TextField } from "@mui/material";
import { useGridApiContext } from "@mui/x-data-grid";

export default function LabSelect(props) {
  const { id, field, value, options } = props;

  const apiRef = useGridApiContext();

  // permite guardar el valor inicial dentro del input del autocomplete
  const [selectedOption, setSelectedOption] = React.useState(
    options.find((option) => option.value === value) || null
  );

  // Cuando el valor en el Autocomplete cambia
  // newValue será el objeto de opción seleccionado
  const handleChange = (event, newValue) => {
    setSelectedOption(newValue);

    apiRef.current.setEditCellValue({
      id: id,
      field: field,
      value: newValue ? newValue.value : null,
    });
  };

  return (
    <FormControl fullWidth>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, val) => option.value === val.value}
        value={selectedOption}
        onChange={handleChange}
        sx={{
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none !important",
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                height: "38px",
                paddingTop: "0px",
                paddingBottom: "0px",
              },
              "& .MuiInputBase-input": {
                paddingTop: "0px !important",
                paddingBottom: "0px !important",
                outline: "none !important",
              },
            }}
          />
        )}
        freeSolo={false}
        disableClearable
        autoHighlight
        openOnFocus
      />
    </FormControl>
  );
}
