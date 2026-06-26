import { MeetingDetail } from "@/types/meeting";
import { formatTimestamp } from "@/lib/utils";

function buildTranscriptText(meeting: MeetingDetail): string {
  return meeting.transcript_segments
    .map((s) => `[${formatTimestamp(s.start_ms)}] ${s.speaker}: ${s.text}`)
    .join("\n\n");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slug(title: string) {
  return title.replace(/\s+/g, "-").toLowerCase();
}

export function exportAsMarkdown(meeting: MeetingDetail) {
  const transcript = buildTranscriptText(meeting);
  const actions = meeting.action_items.map((a) => `- [${a.completed ? "x" : " "}] ${a.text}`).join("\n");
  const content = [
    `# ${meeting.title}`,
    "",
    `**Date:** ${new Date(meeting.meeting_date).toLocaleString()}`,
    "",
    "## Summary",
    meeting.summary || "_No summary_",
    "",
    "## Action Items",
    actions || "_None_",
    "",
    "## Transcript",
    transcript,
  ].join("\n");
  downloadBlob(content, `${slug(meeting.title)}.md`, "text/markdown");
}

export function exportAsTxt(meeting: MeetingDetail) {
  const content = [
    meeting.title,
    "=".repeat(meeting.title.length),
    "",
    "SUMMARY",
    meeting.summary || "No summary",
    "",
    "TRANSCRIPT",
    buildTranscriptText(meeting),
  ].join("\n");
  downloadBlob(content, `${slug(meeting.title)}.txt`, "text/plain");
}

export function exportAsPdf(meeting: MeetingDetail) {
  const transcript = buildTranscriptText(meeting).replace(/\n/g, "<br/>");
  const html = `<!DOCTYPE html><html><head><title>${meeting.title}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
    h1{color:#7c3aed}h2{margin-top:24px;border-bottom:1px solid #eee;padding-bottom:4px}
    p{line-height:1.6}</style></head><body>
    <h1>${meeting.title}</h1>
    <p><strong>Date:</strong> ${new Date(meeting.meeting_date).toLocaleString()}</p>
    <h2>Summary</h2><p>${meeting.summary || "No summary"}</p>
    <h2>Transcript</h2><p>${transcript}</p>
    </body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
