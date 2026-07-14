"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  console.log("Home page rendered");

  useEffect(() => {
    router.push("/auth");
  }, [router]);

  return null;
}
