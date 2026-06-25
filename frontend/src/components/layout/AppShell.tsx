"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { CreateMeetingModal } from "@/components/meetings/CreateMeetingModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark";
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        dark={dark}
        onToggleTheme={toggleTheme}
        onUpload={() => setShowCreate(true)}
      />
      <main className="flex-1 overflow-auto">{children}</main>
      {showCreate && <CreateMeetingModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
