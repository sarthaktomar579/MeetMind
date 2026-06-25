import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <Settings className="mx-auto mb-4 h-12 w-12 text-muted" />
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Profile, integrations, and team settings are coming soon.
        </p>
        <div className="mt-6 space-y-2 text-left text-sm text-muted">
          <p>• Zoom / Google Meet integration — Coming Soon</p>
          <p>• Calendar sync — Coming Soon</p>
          <p>• Team sharing — Coming Soon</p>
          <p>• Real-time transcription bot — Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
