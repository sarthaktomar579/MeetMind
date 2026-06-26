"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { MeetingDetail } from "@/types/meeting";
import { exportAsMarkdown, exportAsPdf, exportAsTxt } from "@/lib/export";

export function ExportMenu({ meeting }: { meeting: MeetingDetail }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-background"
      >
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
            {[
              { label: "Markdown (.md)", action: () => exportAsMarkdown(meeting) },
              { label: "Plain text (.txt)", action: () => exportAsTxt(meeting) },
              { label: "PDF (print)", action: () => exportAsPdf(meeting) },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-xs hover:bg-background"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
