"use client";

import { useEffect, useRef, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import LogoutIcon from "@mui/icons-material/Logout";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { closeAlert } from "@/redux/slices/snackBarSlice";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import {
  clearLoginDetails,
  storeSidebarOption,
} from "@/redux/slices/authSlice";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import Router from "next/router";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function SidebarDrawer({ children }: any) {
  const theme = useTheme();
  const pathname = usePathname();
  const sidebarDrawerRef: any = useRef();
  const router: any = useRouter();
  const dispatch = useDispatch();
  const snackbar = useSelector((state: any) => state.snackbarSlice);
  const accessToken = useSelector((state: any) => state.authSlice.userToken);
  const sidebarOption = useSelector(
    (state: any) => state.authSlice.sidebarOption
  );

  const [open, setOpen] = useState(false);
  const [option, setOption] = useState(sidebarOption || "Dashboard");

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user: any) => {
      if (user?.accessToken && pathname === "/login") {
        router.push(sidebarOption.toLowerCase());
      }
    });
  }, [pathname === "/login"]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        dispatch(
          closeAlert({
            message: "",
            type: "",
          })
        );
        dispatch(clearLoginDetails(null));
        dispatch(storeSidebarOption(""));
        localStorage.clear();
        router.push("/login");
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  const handleSidebarNavigation = (text: string) => {
    const str = text.toLowerCase();
    setOption(text);
    dispatch(storeSidebarOption(text));
    localStorage.setItem("sidebarText", JSON.stringify(text));
    router.push(str);
  };

  return (
    <>
      <Box ref={sidebarDrawerRef} sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Typography variant="h6" noWrap component="div">
                {option}
              </Typography>
              <LogoutIcon onClick={handleLogout} sx={{ cursor: "pointer" }} />
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <List>
            {["Dashboard", "Users", "Roles", "Feedbacks"].map((text, index) => (
              <ListItem
                onClick={() => handleSidebarNavigation(text)}
                sx={{
                  backgroundColor:
                    text === option ? "var(--primaryThemeBlue)" : "#fff",
                  color: text === option ? "#fff" : "var(--iconGrey)",
                }}
                key={text}
                disablePadding
              >
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? (
                      <InboxIcon
                        sx={{
                          color: text === option ? "#fff" : "var(--iconGrey)",
                        }}
                      />
                    ) : (
                      <MailIcon
                        sx={{
                          color: text === option ? "#fff" : "var(--iconGrey)",
                        }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          {children}
        </Main>
      </Box>

      {snackbar.snackbarState && (
        <Snackbar
          open={snackbar.snackbarState}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={1500}
          onClose={() =>
            dispatch(
              closeAlert({
                message: "",
                type: "",
              })
            )
          }
        >
          <Alert
            onClose={() =>
              dispatch(
                closeAlert({
                  message: "",
                  type: "",
                })
              )
            }
            severity={snackbar.snackbarType}
            sx={{ width: "100%" }}
          >
            {snackbar.snackbarMessage}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
