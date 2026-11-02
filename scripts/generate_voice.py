#!/usr/bin/env python3
"""
Generate High-Fidelity Edge-TTS Narration with Word-Level Timestamps.
Extracts exact startMs, endMs, and words for Remotion kinetic typography.
"""

import asyncio
import json
import os
import sys
import edge_tts

DEFAULT_TEXT = (
    "The Sun is a blazing ball of fire, yet deep space is completely pitch black. Why? "
    "On Earth, our thick atmosphere scatters sunlight in every direction. "
    "In space, it is a pure vacuum. With zero particles to bounce the light, darkness wins."
)

DEFAULT_VOICE = "en-US-ChristopherNeural"


async def main():
    raw_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_TEXT
    if os.path.isfile(raw_arg):
        with open(raw_arg, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        text = raw_arg

    voice = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_VOICE

    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(os.path.dirname(script_dir), "public")
    os.makedirs(public_dir, exist_ok=True)

    audio_path = os.path.join(public_dir, "narration.mp3")
    captions_path = os.path.join(public_dir, "captions.json")

    print(f"🎙️ Synthesizing Voiceover with '{voice}'...")
    communicate = edge_tts.Communicate(text, voice, boundary="WordBoundary")

    words = []
    with open(audio_path, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                # offset & duration in 100ns units -> / 10000 gives ms
                start_ms = chunk["offset"] / 10000.0
                duration_ms = chunk["duration"] / 10000.0
                words.append({
                    "word": chunk["text"],
                    "startMs": round(start_ms, 2),
                    "endMs": round(start_ms + duration_ms, 2),
                })

    with open(captions_path, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2)

    total_words = len(words)
    duration_s = (words[-1]["endMs"] / 1000.0) if words else 0
    print(f"✅ Generated: {audio_path} ({os.path.getsize(audio_path)} bytes)")
    print(f"✅ Generated: {captions_path} ({total_words} words, ~{duration_s:.1f}s)")


if __name__ == "__main__":
    asyncio.run(main())
