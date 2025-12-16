"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Ticket,
  Trophy,
  Menu,
  X,
  LogOut,
  Clover,
  DollarSign,
  ExternalLink,
} from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/boloes", label: "Bolões", icon: Trophy },
  { href: "/admin/jogos", label: "Jogos", icon: Ticket },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  // Não mostrar layout na página de login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Mobile */}
      <header className="lg:hidden bg-green-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clover className="w-6 h-6" />
          <span className="font-bold">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? <X /> : <Menu />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-green-700 text-white transform transition-transform lg:translate-x-0 lg:static",
            menuAberto ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-3 p-6 border-b border-green-600">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Clover className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h1 className="font-bold">Mega de Ouro</h1>
              <p className="text-xs text-green-200">Painel Admin</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-2 mt-4 lg:mt-0">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAberto(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-green-100 hover:bg-green-600/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-600 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 text-green-100 hover:bg-green-600/50 rounded-lg"
            >
              <ExternalLink className="w-5 h-5" />
              Ver site
            </Link>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 text-green-100 hover:bg-red-500/80 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {loading ? "Saindo..." : "Sair"}
            </button>
          </div>
        </aside>

        {/* Overlay mobile */}
        {menuAberto && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMenuAberto(false)}
          />
        )}

        {/* Conteúdo */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
