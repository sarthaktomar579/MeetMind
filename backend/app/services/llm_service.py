import re

import httpx

from app.core.config import settings
from app.models import TranscriptSegment

GEMINI_MODELS = ("gemini-2.5-flash", "gemini-2.0-flash")


def _score_segment(question: str, segment: TranscriptSegment) -> int:
    q_words = set(re.findall(r"\w+", question.lower()))
    text_words = set(re.findall(r"\w+", segment.text.lower()))
    speaker_words = set(re.findall(r"\w+", segment.speaker.lower()))
    overlap = len(q_words & text_words)
    speaker_match = 2 if q_words & speaker_words else 0
    return overlap + speaker_match


def _rank_segments(question: str, segments: list[TranscriptSegment]) -> list[TranscriptSegment]:
    ranked = sorted(segments, key=lambda s: _score_segment(question, s), reverse=True)
    return [s for s in ranked if _score_segment(question, s) > 0][:3]


def _build_prompt(question: str, segments: list[TranscriptSegment], summary: str | None) -> str:
    transcript_text = "\n".join(f"{s.speaker}: {s.text}" for s in segments[:80])
    return (
        "You are a meeting intelligence assistant. Answer only from the meeting content below.\n"
        "Be concise, clear, and conversational.\n\n"
        f"Meeting summary:\n{summary or 'Not available'}\n\n"
        f"Transcript:\n{transcript_text}\n\n"
        f"Question: {question}"
    )


def _fallback_answer(
    question: str, segments: list[TranscriptSegment], summary: str | None
) -> tuple[str, list[TranscriptSegment]]:
    top = _rank_segments(question, segments)

    if top:
        parts = [f"{s.speaker} noted that {s.text.rstrip('.')}." for s in top]
        answer = (
            f"From what was discussed in this meeting regarding your question, "
            f"{parts[0]}"
            + (f" {parts[1]}" if len(parts) > 1 else "")
        )
        return answer, top

    if summary:
        return (
            f"While the transcript doesn't directly address that, the meeting summary indicates "
            f"that {summary[:350].rstrip()}.",
            [],
        )

    return (
        "This meeting doesn't appear to cover that topic in detail based on the available transcript.",
        [],
    )


def _ask_gemini(prompt: str) -> str:
    if not settings.gemini_api_key:
        raise RuntimeError("No Gemini API key configured")

    last_error: Exception | None = None
    for model in GEMINI_MODELS:
        try:
            response = httpx.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                params={"key": settings.gemini_api_key},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"maxOutputTokens": 512, "temperature": 0.4},
                },
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            if text and text.strip():
                return text.strip()
        except Exception as exc:
            last_error = exc
            continue

    if last_error:
        raise last_error
    raise RuntimeError("Gemini returned an empty response")


def answer_from_transcript(
    question: str,
    segments: list[TranscriptSegment],
    summary: str | None = None,
) -> tuple[str, list[TranscriptSegment], bool]:
    top = _rank_segments(question, segments)

    try:
        answer = _ask_gemini(_build_prompt(question, segments, summary))
        return answer, top, True
    except Exception:
        answer, sources = _fallback_answer(question, segments, summary)
        return answer, sources, True
