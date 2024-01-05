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
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import PublishIcon from "@mui/icons-material/Publish";
import FeedbackIcon from "@mui/icons-material/Feedback";
import GroupsIcon from "@mui/icons-material/Groups";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LogoutIcon from "@mui/icons-material/Logout";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { closeAlert, openAlert } from "@/redux/slices/snackBarSlice";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import {
  clearLoginDetails,
  storeSidebarOption,
} from "@/redux/slices/authSlice";
import AlertBox from "@/components/resuseables/AlertBox";

const drawerWidth = 240;
const drawerOptions = ["Dashboard", "Generate", "Users", "Roles", "Feedbacks"];
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
  const sidebarOption = useSelector(
    (state: any) => state.authSlice.sidebarOption
  );
  const userToken = JSON.parse(localStorage.getItem("userToken") || "{}");

  const [open, setOpen] = useState(false);
  const [option, setOption] = useState(sidebarOption || "Dashboard");
  const [openAlertBox, setOpenAlertBox] = useState<any>(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!Object.keys(userToken).length && pathname!=="/") {      
      redirect("/")
    }
  }, []);

  const handleClose = (value: string) => {
    setOpenAlertBox(false);
  };

  const handleLogout = () => {
    dispatch(clearLoginDetails(null));
    dispatch(storeSidebarOption(""));
    localStorage.clear();
    router.push("/");
  };

  const handleSidebarNavigation = (text: string) => {
    const pathNameArr: any = pathname?.split("/");
    const str = text.toLowerCase();
    if (pathNameArr?.length > 2) {
      router.push(`${process.env.NEXT_PUBLIC_LOCAL_SERVER}${str}`);
      setOption(text);
      localStorage.setItem("sidebarText", JSON.stringify(text));
      dispatch(storeSidebarOption(text));
    } else {
      setOption(text);
      dispatch(storeSidebarOption(text));
      localStorage.setItem("sidebarText", JSON.stringify(text));
      router.push(str);
    }
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
              <LogoutIcon
                onClick={() => setOpenAlertBox(true)}
                sx={{ cursor: "pointer" }}
              />
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
            {drawerOptions.map((text, index) => {
              return (
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
                      {text === "Dashboard" ? (
                        <DashboardIcon
                          sx={{
                            color: text === option ? "#fff" : "var(--iconGrey)",
                          }}
                        />
                      ) : text === "Generate" ? (
                        <PublishIcon
                          sx={{
                            color: text === option ? "#fff" : "var(--iconGrey)",
                          }}
                        />
                      ) : text === "Roles" ? (
                        <GroupsIcon
                          sx={{
                            color: text === option ? "#fff" : "var(--iconGrey)",
                          }}
                        />
                      ) : text === "Users" ? (
                        <PersonIcon
                          sx={{
                            color: text === option ? "#fff" : "var(--iconGrey)",
                          }}
                        />
                      ) : (
                        <FeedbackIcon
                          sx={{
                            color: text === option ? "#fff" : "var(--iconGrey)",
                          }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          {children}
        </Main>
      </Box>

      {openAlertBox && (
        <AlertBox
          open={openAlertBox}
          cancelText="No Cancel"
          confirmText="Yes Logout"
          mainHeaderText="Are you sure you want to Logout?"
          onClose={handleClose}
          handleClick={handleLogout}
        />
      )}

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
