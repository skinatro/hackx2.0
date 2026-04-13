"use client";

import { usePathname } from "next/navigation";
import { Nvbar } from "./nvbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/timer" || pathname === "/login") return null;

  return <Nvbar />;
}
