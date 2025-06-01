#!/usr/bin/env python3
"""
Creates the full Project Windsurf directory structure for all agents, protocols, tools, logs, and tick folders.
Idempotent: safe to run multiple times.
"""
import os
from pathlib import Path
import json

AGENT_ACTOR_NAMES = [
    "agent_congress",
    "agent_doj_eoir",
    "agent_dhs_ops",
    "agent_bar",
    "agent_ngos",
    "agent_judiciary",
    "agent_media",
    "agent_civsoc",
    "agent_un",
    "agent_bigtech",
    "agent_academia",
    "agent_children",
]
AGENT_META_NAMES = [
    "meta_supervisor",
    "meta_planner",
    "meta_tool_orchestrator",
    "meta_topology",
    "meta_protocol_dev",
    "meta_agent_manager",
    "meta_windsurf_ops",
    "meta_documenter",
    "meta_security",
    "meta_simulator",
]

ROOT = Path(__file__).resolve().parents[5]  # project root

folders = [
    ROOT / "windsurf",
    ROOT / "windsurf" / "agents",
    ROOT / "windsurf" / "protocols",
    ROOT / "windsurf" / "tools",
    ROOT / "windsurf" / "logs",
]

def agent_folders():
    for name in AGENT_ACTOR_NAMES + AGENT_META_NAMES + ["human"]:
        base = ROOT / "windsurf" / "agents" / name
        yield base
        for sub in ("inbox", "outbox", "cycles"):
            yield base / sub
        yield base / "memory.md"

def protocol_files():
    proto = ROOT / "windsurf" / "protocols"
    yield proto / "ACP.md"
    yield proto / "MCP.md"
    yield proto / "next_assignments.json"
    yield proto / "LLM_TIERS.md"

TOOLS = [ROOT / "windsurf" / "tools" / "size_guard.py"]

def main():
    for folder in folders:
        folder.mkdir(parents=True, exist_ok=True)
    for path in agent_folders():
        if path.suffix:
            if not path.exists():
                path.write_text("")
        else:
            path.mkdir(parents=True, exist_ok=True)
    for f in protocol_files():
        if not f.exists():
            if f.suffix == ".md":
                f.write_text(f"# {f.stem}\n")
            elif f.suffix == ".json":
                f.write_text("{}\n")
    for t in TOOLS:
        if not t.exists():
            t.write_text("# size_guard placeholder\n")
    print("[directory-creater] Full structure created under", ROOT / "windsurf")

if __name__ == "__main__":
    main()
