"use client";

import dynamic from "next/dynamic";

const NavbarWrapper = dynamic(() => import("./NavbarWrapper"), {
  ssr: false,
});

const CustomCursor = dynamic(() => import("@/ui/components/custom-cursor"), {
  ssr: false,
});

export default function ClientChrome() {
  return (
    <>
      <NavbarWrapper />
      <CustomCursor />
    </>
  );
}