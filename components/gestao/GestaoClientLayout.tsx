"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function GestaoClientLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setRole(localStorage.getItem("mb_role") || "proprietario");
  }, [pathname]);

  const isCaixa = role === "caixa";
  const isLoginPage = pathname === "/gestao/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#fdf4f9]">
      {!isCaixa && <Sidebar />}
      <div className={`${!isCaixa ? "lg:ml-64" : ""} pb-20 lg:pb-0`}>
        {children}
      </div>
    </div>
  );
}
