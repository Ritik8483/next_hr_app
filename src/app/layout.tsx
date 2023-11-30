"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { useEffect, useState } from "react";
import SidebarDrawer from "@/pages/Drawer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
const inter = Inter({ subsets: ["latin"] });

const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const persistor = persistStore(store);
  const [userToken, setUserToken] = useState("");
  const router: any = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const paramsId = params?.get("id");

  useEffect(() => {
    const sidebarText = JSON.parse(localStorage.getItem("sidebarText") || "{}");

    onAuthStateChanged(auth, (user: any) => {
      if (user && user.email === "ritik.chauhan@quokkalabs.com") {
        setUserToken(user?.accessToken);
        router.push(
          sidebarText.length > 1 ? sidebarText.toLowerCase() : "/dashboard"
        );
      } else {
        setUserToken("");
        router.push(
          pathname === "/form"
            ? `/form?id=${paramsId}`
            : pathname === "/user-login"
            ? `/user-login?id=${paramsId}`
            : "/login"
        );
      }
    });
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <PersistGate
            loading={null}
            persistor={persistor}
            key={userToken.length}
          >
            {userToken ? <SidebarDrawer>{children}</SidebarDrawer> : children}
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
