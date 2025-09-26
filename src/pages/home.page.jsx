import React from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

import {
  selectCurrentUser,
  selectCurrentUserRole,
} from "../features/authSlice";
import {
  IconBasketDollar,
  IconPackage,
  IconPhotoUp,
  IconShieldCog,
  IconTableImport,
  IconUserEdit,
  IconUserUp,
} from "@tabler/icons-react";

const LINKS = [
  {
    title: "Clientes",
    description: "Gestioná el alta, edición y consulta de clientes.",
    to: "/clients/crud",
    icon: <IconUserEdit size={32} />,
    roles: ["admin", "superadmin"],
    tag: "ABM",
  },
  {
    title: "Productos",
    description: "ABM de productos con filtros y edición.",
    to: "/products/crud",
    icon: <IconPackage size={32} />,
    roles: ["admin", "superadmin"],
    tag: "ABM",
  },
  {
    title: "Imágenes de productos",
    description: "Subí, ordená y eliminá imágenes principales y secundarias.",
    to: "/products/images",
    icon: <IconPhotoUp size={32} />,
    roles: ["images", "admin", "superadmin"],
    tag: "Medios",
  },
  {
    title: "Migración de clientes",
    description: "Importá clientes de fuentes externas de manera controlada.",
    to: "/clients/migration",
    icon: <IconUserUp size={32} />,
    roles: ["superadmin"],
    tag: "Migración",
  },
  {
    title: "Migración de productos",
    description: "Importá y validá lotes de productos antes de publicar.",
    to: "/products/migration",
    icon: <IconTableImport size={32} />,
    roles: ["superadmin"],
    tag: "Migración",
  },
  {
    title: "Gestión de pedidos",
    description: "Revisá, prepará y actualizá el estado de los pedidos.",
    to: "/orders/manage",
    icon: <IconBasketDollar size={32} />,
    roles: ["admin", "superadmin"],
    tag: "Operación",
  },
  {
    title: "Administradores",
    description: "Alta/baja, roles y estado de cuentas administrativas.",
    to: "/admins/manage",
    icon: <IconShieldCog size={32} />,
    roles: ["superadmin"],
    tag: "Seguridad",
  },
];

function ActionCard({ to, icon, title, description, tag }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2,
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={to}
        sx={{ height: "100%", display: "flex", alignItems: "stretch" }}
      >
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            {icon}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ flex: 1, justifyContent: "space-between" }}
            >
              <Typography variant="h6" component="h3">
                {title}
              </Typography>
              {tag && <Chip size="small" label={tag} sx={{ ml: "auto" }} />}
            </Stack>
          </Stack>
          <Divider />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.5 }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const HomePage = () => {
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectCurrentUserRole);

  const visibleLinks = React.useMemo(() => {
    if (!role) return LINKS;
    return LINKS.filter((l) => !l.roles || l.roles.includes(role));
  }, [role]);

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3, position: "relative" }}>
      <Box mb={4}>
        <Stack
          direction={"row"}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" mb={1}>
            Bienvenido al Gestor Medinor
            {user?.fullName ? `, ${user.fullName}` : ""}
          </Typography>
          {role && <Chip label={`Rol: ${role}`} variant="outlined" />}
        </Stack>

        <Typography variant="body1" color="text.secondary">
          Elegí una sección para comenzar.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            md: "1fr",
            lg: "repeat(2, 1fr)",
            xl: "repeat(3, 1fr)",
          },
        }}
      >
        {visibleLinks.map((item) => (
          <ActionCard key={item.to} {...item} />
        ))}
      </Box>
    </Box>
  );
};

export default HomePage;
