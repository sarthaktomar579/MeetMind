"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/meetings", label: "Meetings", icon: Home },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  dark: boolean;
  onToggleTheme: () => void;
  onUpload: () => void;
}

export function Sidebar({ dark, onToggleTheme, onUpload }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">MeetMind</p>
          <p className="text-[10px] text-white/50">Meeting Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-sidebar-hover text-white"
                : "text-white/70 hover:bg-sidebar-hover hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <button
          onClick={onUpload}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-sidebar-hover hover:text-white"
        >
          <Upload className="h-4 w-4" />
          Import Transcript
        </button>
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <button
          onClick={onToggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-sidebar-hover hover:text-white"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? "Light mode" : "Dark mode"}
        </button>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold">
            SK
          </div>
          <div className="text-xs">
            <p className="font-medium">Sarthak Tomar</p>
            <p className="text-white/50">Default user</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
