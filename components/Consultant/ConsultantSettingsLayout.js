import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import KeyIcon from "@mui/icons-material/Key";
import HandshakeIcon from "@mui/icons-material/Handshake";
import MenuIcon from "@mui/icons-material/Menu";
import CallIcon from "@mui/icons-material/Call";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
//import { styled } from "@mui/material/styles";

const drawerWidth = 240;

// const Div = styled("div")(({ theme }) => ({
//   marginTop: "80px",
// }));

export default function MemberSettingsLayout(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const { t } = useTranslation("settings");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <List>
        <NextLink
          key="profileSettings"
          href="/consultant/profile-settings"
          passHref
        >
          <MuiLink color="inherit" underline="none">
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <ManageAccountsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t(
                    "settings.profile-settings.profile-settings-title"
                  )}
                />
              </ListItemButton>
            </ListItem>
          </MuiLink>
        </NextLink>
        <NextLink
          key="meetingSettings"
          href="/consultant/meeting-settings"
          passHref
        >
          <MuiLink color="inherit" underline="none">
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <HandshakeIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t(
                    "settings.meeting-settings.meeting-settings-title"
                  )}
                />
              </ListItemButton>
            </ListItem>
          </MuiLink>
        </NextLink>
        <NextLink
          key="contactSettings"
          href="/consultant/contact-settings"
          passHref
        >
          <MuiLink color="inherit" underline="none">
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <CallIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t(
                    "settings.contact-settings.contact-settings-title"
                  )}
                />
              </ListItemButton>
            </ListItem>
          </MuiLink>
        </NextLink>
        <NextLink
          key="changePassword"
          href="/consultant/change-password"
          passHref
        >
          <MuiLink color="inherit" underline="none">
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <KeyIcon />
                </ListItemIcon>
                <ListItemText primary={t("settings.changepw.changepwtitle")} />
              </ListItemButton>
            </ListItem>
          </MuiLink>
        </NextLink>
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="absolute"
        sx={{
          marginTop: { xs: "55px", sm: "70px" },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {props.heading}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              marginTop: "70px",
              height: "84%",
              borderRight: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <section>{props.children}</section>
      </Box>
    </Box>
  );
}
