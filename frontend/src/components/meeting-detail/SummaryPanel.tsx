"use client";

import { useState } from "react";
import { Check, ListTodo, Plus, Sparkles, Trash2 } from "lucide-react";
import { ActionItem, Topic } from "@/types/meeting";
import { api } from "@/lib/api";
import { cn, formatTimestamp } from "@/lib/utils";

interface SummaryPanelProps {
  meetingId: number;
  summary?: string | null;
  topics: Topic[];
  actionItems: ActionItem[];
  onActionItemsChange: (items: ActionItem[]) => void;
  onTopicClick: (startMs: number) => void;
}

export function SummaryPanel({
  meetingId,
  summary,
  topics,
  actionItems,
  onActionItemsChange,
  onTopicClick,
}: SummaryPanelProps) {
  const [tab, setTab] = useState<"summary" | "actions" | "topics">("summary");
  const [newItem, setNewItem] = useState("");

  async function toggleItem(item: ActionItem) {
    const updated = await api.updateActionItem(item.id, { completed: !item.completed });
    onActionItemsChange(actionItems.map((i) => (i.id === item.id ? updated : i)));
  }

  async function addItem() {
    if (!newItem.trim()) return;
    const created = await api.createActionItem(meetingId, newItem.trim());
    onActionItemsChange([...actionItems, created]);
    setNewItem("");
  }

  async function removeItem(id: number) {
    await api.deleteActionItem(id);
    onActionItemsChange(actionItems.filter((i) => i.id !== id));
  }

  const tabs = [
    { id: "summary" as const, label: "AI Summary", icon: Sparkles },
    { id: "actions" as const, label: "Action Items", icon: ListTodo },
    { id: "topics" as const, label: "Topics", icon: Sparkles },
  ];

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="flex border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium",
              tab === id ? "border-b-2 border-brand text-brand" : "text-muted"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "summary" && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-brand">
              <Sparkles className="h-4 w-4" />
              AI-Generated Summary
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {summary || "No summary available for this meeting."}
            </p>
          </div>
        )}

        {tab === "actions" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder="Add action item..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
              <button
                onClick={addItem}
                className="rounded-lg bg-brand p-2 text-white hover:bg-brand/90"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <button
                  onClick={() => toggleItem(item)}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                    item.completed ? "border-brand bg-brand text-white" : "border-border"
                  )}
                >
                  {item.completed && <Check className="h-3 w-3" />}
                </button>
                <div className="flex-1">
                  <p className={cn("text-sm", item.completed && "text-muted line-through")}>
                    {item.text}
                  </p>
                  {item.assignee && (
                    <p className="mt-1 text-xs text-muted">Assigned to {item.assignee}</p>
                  )}
                </div>
                <button onClick={() => removeItem(item.id)} className="text-muted hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "topics" && (
          <div className="space-y-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onTopicClick(topic.start_ms)}
                className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:border-brand/40 hover:bg-brand-muted/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{topic.title}</p>
                  <span className="text-[10px] text-muted">{formatTimestamp(topic.start_ms)}</span>
                </div>
                {topic.description && (
                  <p className="mt-1 text-xs text-muted line-clamp-2">{topic.description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
