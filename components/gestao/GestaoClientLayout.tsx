"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import GestaoTopBar from "./GestaoTopBar";
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
      <div className={`${!isCaixa ? "lg:ml-64" : ""} pb-20 lg:pb-0 flex flex-col min-h-screen`}>
        {!isCaixa && <GestaoTopBar />}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
