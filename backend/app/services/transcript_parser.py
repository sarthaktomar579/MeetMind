import json
import re
from datetime import datetime

from app.schemas.meeting import TranscriptSegmentCreate

VTT_TIMESTAMP = re.compile(
    r"(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})"
)


def _to_ms(h: str, m: str, s: str, ms: str) -> int:
    return int(h) * 3_600_000 + int(m) * 60_000 + int(s) * 1_000 + int(ms)


def parse_vtt(content: str) -> list[TranscriptSegmentCreate]:
    lines = content.replace("\r\n", "\n").split("\n")
    segments: list[TranscriptSegmentCreate] = []
    i = 0
    order = 0
    while i < len(lines):
        line = lines[i].strip()
        match = VTT_TIMESTAMP.match(line)
        if match:
            start_ms = _to_ms(*match.groups()[:4])
            end_ms = _to_ms(*match.groups()[4:])
            i += 1
            text_lines: list[str] = []
            while i < len(lines) and lines[i].strip() and not VTT_TIMESTAMP.match(lines[i].strip()):
                cue = lines[i].strip()
                speaker = "Speaker"
                body = cue
                if ":" in cue:
                    maybe_speaker, rest = cue.split(":", 1)
                    if len(maybe_speaker.split()) <= 3:
                        speaker = maybe_speaker.strip()
                        body = rest.strip()
                text_lines.append(body)
                i += 1
            if text_lines:
                segments.append(
                    TranscriptSegmentCreate(
                        speaker=speaker,
                        start_ms=start_ms,
                        end_ms=end_ms,
                        text=" ".join(text_lines),
                        segment_order=order,
                    )
                )
                order += 1
            continue
        i += 1
    return segments


def parse_json_transcript(content: str) -> list[TranscriptSegmentCreate]:
    data = json.loads(content)
    if isinstance(data, dict) and "segments" in data:
        data = data["segments"]
    segments: list[TranscriptSegmentCreate] = []
    for order, item in enumerate(data):
        segments.append(
            TranscriptSegmentCreate(
                speaker=item.get("speaker", "Speaker"),
                start_ms=int(item.get("start_ms", item.get("start", 0))),
                end_ms=int(item.get("end_ms", item.get("end", 0))),
                text=item.get("text", ""),
                segment_order=order,
            )
        )
    return segments


def parse_plain_text(content: str, default_speaker: str = "Speaker") -> list[TranscriptSegmentCreate]:
    segments: list[TranscriptSegmentCreate] = []
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    for order, line in enumerate(lines):
        speaker = default_speaker
        text = line
        ts_match = re.match(r"^\[(\d{2}):(\d{2})\]\s*(.*)$", line)
        if ts_match:
            minutes, seconds = int(ts_match.group(1)), int(ts_match.group(2))
            remainder = ts_match.group(3)
            start_ms = (minutes * 60 + seconds) * 1000
            if ":" in remainder:
                sp, body = remainder.split(":", 1)
                speaker = sp.strip()
                text = body.strip()
            else:
                text = remainder
            end_ms = start_ms + max(len(text.split()) * 350, 3000)
        else:
            start_ms = order * 5000
            end_ms = start_ms + 5000
            if ":" in line:
                sp, body = line.split(":", 1)
                if len(sp.split()) <= 3:
                    speaker = sp.strip()
                    text = body.strip()
        segments.append(
            TranscriptSegmentCreate(
                speaker=speaker,
                start_ms=start_ms,
                end_ms=end_ms,
                text=text,
                segment_order=order,
            )
        )
    return segments


def parse_transcript_file(filename: str, content: str) -> list[TranscriptSegmentCreate]:
    lower = filename.lower()
    if lower.endswith(".vtt"):
        return parse_vtt(content)
    if lower.endswith(".json"):
        return parse_json_transcript(content)
    return parse_plain_text(content)


def estimate_duration_seconds(segments: list[TranscriptSegmentCreate]) -> int:
    if not segments:
        return 0
    return max(1, max(seg.end_ms for seg in segments) // 1000)


def generate_mock_summary(title: str, segments: list[TranscriptSegmentCreate]) -> str:
    speakers = sorted({seg.speaker for seg in segments})
    preview = " ".join(seg.text for seg in segments[:3])
    topics = ", ".join(speakers[:4])
    return (
        f"This meeting, \"{title}\", covered key discussion points among {', '.join(speakers) or 'participants'}. "
        f"Primary voices included {topics}. "
        f"Highlights: {preview[:280]}{'...' if len(preview) > 280 else ''}"
    )


def generate_mock_action_items(segments: list[TranscriptSegmentCreate]) -> list[dict]:
    keywords = ("will", "should", "need to", "action", "follow up", "by friday", "next week")
    items: list[dict] = []
    for seg in segments:
        lower = seg.text.lower()
        if any(k in lower for k in keywords):
            items.append({"text": seg.text.rstrip("."), "assignee": seg.speaker, "completed": False})
        if len(items) >= 5:
            break
    if not items and segments:
        items.append(
            {
                "text": f"Follow up on outcomes from {segments[0].speaker}'s discussion points",
                "assignee": segments[0].speaker,
                "completed": False,
            }
        )
    return items


def generate_mock_topics(segments: list[TranscriptSegmentCreate]) -> list[dict]:
    if not segments:
        return []
    chunk = max(1, len(segments) // 3)
    topics: list[dict] = []
    labels = ["Opening & context", "Main discussion", "Decisions & next steps"]
    for idx, label in enumerate(labels):
        seg = segments[min(idx * chunk, len(segments) - 1)]
        topics.append(
            {
                "title": label,
                "description": seg.text[:160],
                "start_ms": seg.start_ms,
            }
        )
    return topics
