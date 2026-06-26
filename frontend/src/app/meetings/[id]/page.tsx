import { Suspense } from "react";
import MeetingDetailContent from "./MeetingDetailContent";

export default function MeetingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <MeetingDetailContent />
    </Suspense>
  );
}
