import InventoryPage from "@/components/inventory/InventoryPage";
import { Metadata } from "next";

export const metadata = {
  title: "Inventory - Bashitha Ceramics",
  description: "Manage your product inventory",
};

export default function Page() {
  return <InventoryPage />;
}

export const dynamic = "force-dynamic";
