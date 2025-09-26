import * as React from "react";
import { Outlet, useNavigate } from "react-router";
import {
  DashboardLayout,
  SidebarFooterProps,
  ThemeSwitcher,
} from "@toolpad/core/DashboardLayout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Logout, Settings } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";

import { logout, selectCurrentUser } from "../features/authSlice";
import { Box } from "@mui/system";

function BottomMenu({ mini }: SidebarFooterProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ height: "fit" }}>
      {!mini && (
        <>
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              m: 2,
            }}
          >
            <Stack>
              <Stack direction={"row"}>
                <Typography variant="body1" fontWeight={700}>
                  {user?.username}
                </Typography>
                <Chip size="small" label={`${user?.role}`} sx={{ ml: 1 }} />
              </Stack>
              <Typography variant="body2" color="gray">
                {user?.fullName}
              </Typography>
            </Stack>
            <Box>
              <IconButton onClick={handleLogout}>
                <Logout fontSize="medium" />
              </IconButton>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

export default function Layout() {
  return (
    <DashboardLayout
      slots={{ toolbarActions: ThemeSwitcher, sidebarFooter: BottomMenu }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
