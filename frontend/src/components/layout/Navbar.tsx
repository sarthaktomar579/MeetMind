"use client";

import { Bell, Search } from "lucide-react";

interface NavbarProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export function Navbar({ title, subtitle, searchValue, onSearchChange, actions }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          {onSearchChange !== undefined && (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none ring-brand focus:ring-2"
              />
            </div>
          )}
          {actions}
          <button className="rounded-lg border border-border p-2 text-muted hover:bg-background">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
