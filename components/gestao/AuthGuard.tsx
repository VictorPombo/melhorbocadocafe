"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isLoginPage = pathname === "/gestao/login";
    const isAuthed = localStorage.getItem("mb_auth") === "true";
    const role = localStorage.getItem("mb_role") || "proprietario";

    if (!isAuthed && !isLoginPage) {
      router.replace("/gestao/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#fdf4f9] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#e6398f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
