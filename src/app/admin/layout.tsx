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
import { ErrorBoundary } from "@/components/admin/ErrorBoundary";


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
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="lg:hidden bg-green-600 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Clover className="w-6 h-6" />
          <span className="font-bold">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-green-700"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? <X /> : <Menu />}
        </Button>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-green-700 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen flex flex-col",
            menuAberto ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-green-600">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Clover className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h1 className="font-bold text-white">Mega de Ouro</h1>
              <p className="text-xs text-green-200">Painel Admin</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-green-100 hover:bg-green-600/50 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-green-600 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 text-green-100 hover:bg-green-600/50 hover:text-white rounded-lg transition-all duration-200"
            >
              <ExternalLink className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Ver site</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 text-green-100 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{loading ? "Saindo..." : "Sair"}</span>
            </button>
          </div>
        </aside>

        {/* Overlay mobile */}
        {menuAberto && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMenuAberto(false)}
          />
        )}

        {/* Conteúdo */}
        <main className="flex-1 w-full min-w-0">
          <div className="max-w-7xl mx-auto p-6 lg:p-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
