import Overview from "@/components/overview/overview";
import { Metadata } from "next";

export const metadata = {
  title: "Overview - Bashitha Ceramics",
  description: "View your sales, inventory, and customer data at a glance",
};

export default function Page() {
  return <Overview />;
}

export const dynamic = "force-dynamic";
