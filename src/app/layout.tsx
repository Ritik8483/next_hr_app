"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { useEffect } from "react";
import SidebarDrawer from "@/pages/Drawer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router: any = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const paramsId = params?.get("id");

  const sidebarText = JSON.parse(localStorage.getItem("sidebarText") || "{}");
  const userFirebaseToken = JSON.parse(
    localStorage.getItem("userFirebaseToken") || "{}"
  );
  useEffect(() => {
    if (
      Object.keys(userFirebaseToken).length &&
      pathname === "/login" &&
      userFirebaseToken?.email === "ritik.chauhan@quokkalabs.com"
    ) {
      router.push(sidebarText.toLowerCase());
    } else if (
      Object.keys(userFirebaseToken).length &&
      userFirebaseToken?.email === "ritik.chauhan@quokkalabs.com"
    ) {
      router.push(
        Object.keys(sidebarText).length > 1
          ? sidebarText.toLowerCase()
          : "/dashboard"
      );
    } else {
      router.push(
        pathname === "/form"
          ? `/form?id=${paramsId}`
          : pathname === "/user-login"
          ? `/user-login?id=${paramsId}`
          : "/login"
      );
    }
    // });
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {Object.keys(userFirebaseToken).length && pathname === "/login" ? (
              router.push(sidebarText.toLowerCase())
            ) : Object.keys(userFirebaseToken).length &&
              userFirebaseToken?.email === "ritik.chauhan@quokkalabs.com" ? (
              <SidebarDrawer>{children}</SidebarDrawer>
            ) : (
              children
            )}
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
