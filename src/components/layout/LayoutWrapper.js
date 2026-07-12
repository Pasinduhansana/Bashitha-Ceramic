"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideNavbarRoutes = [
    "/login",
    "/forgot-password"
  ];

  const hideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      {children}
    </>
  );
}