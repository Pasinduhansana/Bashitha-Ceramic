"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import NavigationPanel from "./Navigationpanel";

export default function LayoutWrapper({ children, userPermissions=[] }) {
  const [active, setActive] = useState("Overview");
  const pathname = usePathname();

  const hideNavbarRoutes = [
    "/login",
    "/forgot-password"
  ];

  const hideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <>
      {!hideNavbar && <div className="flex flex-col"><Header /><NavigationPanel
        active={active}
        onChange={setActive}
        userPermissions={userPermissions}
      /></div>}

      {children}
    </>
  );
}