import { useState, useRef, useEffect } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import MoreIcon from "@mui/icons-material/MoreVert";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
import { auth } from "../firebase.config";
import { useRouter } from "next/router";
import { useTranslation, i18n } from "next-i18next";
import { useDispatch, useSelector } from "react-redux";
import { logout, loggedInUser } from "../redux/userSlice";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));
const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

export default function Layout(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [mobileTransMenuAnchorEl, setMobileTransMenuAnchorEl] = useState(null);
  const [transOpen, setTransOpen] = useState(false);
  const transAnchorRef = useRef(null);

  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    try {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const idTokenResult = await user.getIdTokenResult();

          const dbRes = await axios.post(
            "/api/create-or-get-user",
            {},
            { headers: { authtoken: idTokenResult.token } }
          );
          console.log("create or get user res (useEffect): ", dbRes);

          dispatch(
            loggedInUser({
              id: dbRes.data.id,
              email: dbRes.data.email,
              role: dbRes.data.role,
              token: idTokenResult.token,
            })
          );
        } else {
          dispatch(logout());
          console.log("user is not logged in.");
        }
      });
    } catch (err) {
      console.log(error.message);
    }
  }, []);

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(transOpen);
  useEffect(() => {
    if (prevOpen.current === true && transOpen === false) {
      transAnchorRef.current.focus();
    }

    prevOpen.current = transOpen;
  }, [transOpen]);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isMobileTransMenuOpen = Boolean(mobileTransMenuAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileTransMenuOpen = (event) => {
    setMobileTransMenuAnchorEl(event.currentTarget);
  };
  const handleMobileTransMenuClose = () => {
    setMobileTransMenuAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleTransToggle = () => {
    setTransOpen((prevOpen) => !prevOpen);
  };

  const handleTransClose = (event) => {
    if (
      transAnchorRef.current &&
      transAnchorRef.current.contains(event.target)
    ) {
      return;
    }

    setTransOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setTransOpen(false);
    } else if (event.key === "Escape") {
      setTransOpen(false);
    }
  }

  const handleLogout = () => {
    auth.signOut();
    dispatch(logout());
    handleMenuClose();
    router.push("/");
  };
  const handleMobileLogout = () => {
    auth.signOut();
    dispatch(logout());
    handleMobileMenuClose();
    router.push("/");
  };

  const profileLoggedOut = (
    <NextLink href="/account">
      <MuiLink color="inherit">
        <IconButton size="large" edge="end" color="inherit">
          <AccountCircle />
        </IconButton>
      </MuiLink>
    </NextLink>
  );
  const profileLoggedIn = (
    <IconButton edge="end" color="inherit" onClick={handleProfileMenuOpen}>
      <AccountCircle />
    </IconButton>
  );
  const loggedInMobileButtons = [
    <MenuItem key="profile">
      <IconButton size="large" color="inherit">
        <AccountCircle />
      </IconButton>
      <p>{t("nav.profile")}</p>
    </MenuItem>,
    <MenuItem key="logout" onClick={handleMobileLogout}>
      <IconButton size="large" color="inherit">
        <LogoutIcon />
      </IconButton>
      <p>{t("nav.logout")}</p>
    </MenuItem>,
  ];

  const loggedOutMobileButtons = (
    <NextLink href="/account" passHref>
      <MuiLink color="inherit" underline="none">
        <MenuItem onClick={handleMobileMenuClose}>
          <IconButton size="large" color="inherit">
            <AccountCircle />
          </IconButton>
          <p>{t("nav.account")}</p>
        </MenuItem>
      </MuiLink>
    </NextLink>
  );

  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>
        <p>{t("nav.profile")}</p>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <p>{t("nav.logout")}</p>
      </MenuItem>
    </Menu>
  );

  const renderTransMenu = (
    <Popper
      open={transOpen}
      anchorEl={transAnchorRef.current}
      role={undefined}
      placement="bottom-start"
      transition
      disablePortal
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin:
              placement === "bottom-start" ? "left top" : "left bottom",
          }}
        >
          <Paper>
            <ClickAwayListener onClickAway={handleTransClose}>
              <MenuList
                autoFocusItem={transOpen}
                id="composition-menu"
                aria-labelledby="composition-button"
                onKeyDown={handleListKeyDown}
              >
                <MenuItem
                  onClick={(e) => {
                    i18n.changeLanguage("en");
                    handleTransClose(e);
                  }}
                >
                  English
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    i18n.changeLanguage("tr");
                    handleTransClose(e);
                  }}
                >
                  Türkçe
                </MenuItem>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {i18n.language == "en" ? (
        <MenuItem onClick={handleMobileTransMenuOpen}>
          <IconButton size="large" color="inherit">
            <Image src="/images/united-kingdom.png" height={22} width={22} />
          </IconButton>
          <p>English</p>
        </MenuItem>
      ) : (
        <MenuItem onClick={handleMobileTransMenuOpen}>
          <IconButton size="large" color="inherit">
            <Image src="/images/turkey.png" height={22} width={22} />
          </IconButton>
          <p>Türkçe</p>
        </MenuItem>
      )}
      {user === null ? loggedOutMobileButtons : loggedInMobileButtons}
    </Menu>
  );

  const renderMobileTransMenu = (
    <Menu
      anchorEl={mobileTransMenuAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileTransMenuOpen}
      onClose={handleMobileTransMenuClose}
    >
      <MenuItem
        onClick={(e) => {
          i18n.changeLanguage("en");
          handleMobileTransMenuClose(e);
        }}
      >
        English
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          i18n.changeLanguage("tr");
          handleMobileTransMenuClose(e);
        }}
      >
        Türkçe
      </MenuItem>
    </Menu>
  );

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {i18n.language}
            </Typography>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase placeholder={t("nav.search")} />
            </Search>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton
                size="large"
                color="inherit"
                ref={transAnchorRef}
                onClick={handleTransToggle}
              >
                {i18n.language == "en" ? (
                  <Image
                    src="/images/united-kingdom.png"
                    height={22}
                    width={22}
                  />
                ) : (
                  <Image src="/images/turkey.png" height={22} width={22} />
                )}
              </IconButton>
              {renderTransMenu}
              {user === null ? profileLoggedOut : profileLoggedIn}
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        {renderMobileMenu}
        {renderProfileMenu}
        {renderMobileTransMenu}
      </Box>

      <Main>{props.children}</Main>
    </div>
  );
}
