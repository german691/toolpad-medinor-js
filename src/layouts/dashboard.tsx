import * as React from "react";
import { Outlet, useNavigate } from "react-router";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { Logout, Settings } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

function TopMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <Stack direction={"row"} spacing={2} alignItems="center">
      <ThemeSwitcher />

      <IconButton onClick={handleClick}>
        <Settings />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}

export default function Layout() {
  return (
    <DashboardLayout slots={{ toolbarActions: TopMenu }}>
      <Outlet />
    </DashboardLayout>
  );
}
