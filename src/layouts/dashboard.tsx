import * as React from "react";
import { Outlet, useNavigate } from "react-router";
import {
  DashboardLayout,
  SidebarFooterProps,
  ThemeSwitcher,
} from "@toolpad/core/DashboardLayout";
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { logout, selectCurrentUser } from "../features/authSlice";
import { Box } from "@mui/system";
import { IconLogout } from "@tabler/icons-react";

function BottomMenu({ mini }: SidebarFooterProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <>
      {!mini ? (
        <Box sx={{ maxHeight: "fit" }}>
          <Divider />
          <Box
            sx={{
              height: "fit",
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
                <IconLogout size={24} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ position: "relative", minWidth: "84px", marginBottom: "8px" }}>
          <Box>
            <Box sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              w: "full",
              paddingInline: "8px",
            }}>

              <Button onClick={handleLogout} color="inherit" sx={{ width: "68px", height: "60px", borderRadius: "8px" }}>
                <IconLogout size={24} />
              </Button>
            </Box>
          </Box>
        </Box>
      )
      }
    </>
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
