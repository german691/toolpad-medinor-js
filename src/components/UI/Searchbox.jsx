import { Search } from "@mui/icons-material";
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { useState } from "react";

export default function Searchbox({ setSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    setSearch(searchQuery);
  };

  return (
    <Box sx={{ width: "300px" }}>
      <FormControl variant="outlined" fullWidth>
        <InputLabel size="small" htmlFor="outlined-adornment-password">
          Buscar
        </InputLabel>
        <OutlinedInput
          value={searchQuery}
          onChange={handleInputChange}
          size="small"
          id="outlined-adornment-password"
          endAdornment={
            <InputAdornment position="end">
              <IconButton edge="end" onClick={handleSearch}>
                <Search />
              </IconButton>
            </InputAdornment>
          }
          label="Buscar"
        />
      </FormControl>
    </Box>
  );
}
