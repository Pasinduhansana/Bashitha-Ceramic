import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";

export const metadata = {
  title: "Bashitha Ceramics",
  description: "Inventory Management System",
};

export default async function RootLayout({ children }) {

  const cookieStore = await cookies();
  const token =
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("token")?.value;

  let userPermissions = [];

  if (token) {
    const payload = verifyToken(token);

    if (payload) {
      userPermissions = await getUserPermissions(
        payload.id,
        payload.roleId
      );
    }
  }


  return (
    <html lang="en">
      <body>
        <LayoutWrapper userPermissions={userPermissions}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}