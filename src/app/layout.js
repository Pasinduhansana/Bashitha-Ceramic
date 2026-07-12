import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

export const metadata = {
  title: "Bashitha Ceramics",
  description: "Inventory Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}