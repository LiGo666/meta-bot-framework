#!/usr/bin/env python3
"""Command-line utility for advancing Project Windsurf ticks.

Usage examples
--------------
$ python -m windsurf.next_tick                      # just advance tick
$ python -m windsurf.next_tick -m "initial prompt"  # advance + store human message

Effect:
• Increments `global_state.json["tick"]` atomically.
• Creates `/agents/human/outbox/tikN/` directory.
• If `-m/--message` is given, saves it to `input.txt` inside that folder.
• Ensures each agent has a stub `cycles/N.json` file.

The script is idempotent per run (does nothing if already at target).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List

AGENT_ACTOR_NAMES: List[str] = [
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
AGENT_META_NAMES: List[str] = [
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

ROOT = Path(__file__).resolve().parent


def _load_state() -> dict:
    gpath = ROOT / "global_state.json"
    if not gpath.exists():
        raise FileNotFoundError("global_state.json not found – run windsurf_bootstrap.py first")
    return json.loads(gpath.read_text())


def _save_state(state: dict) -> None:
    gpath = ROOT / "global_state.json"
    gpath.write_text(json.dumps(state, indent=2))


def _touch_cycles(tick: int) -> None:
    agents_dir = ROOT / "agents"
    for name in AGENT_ACTOR_NAMES + AGENT_META_NAMES + ["human"]:
        cycles_path = agents_dir / name / "cycles"
        cycles_path.mkdir(parents=True, exist_ok=True)
        stub = cycles_path / f"{tick}.json"
        if not stub.exists():
            stub.write_text(json.dumps({"thought": "", "action": "", "result": ""}, indent=2))


def _human_outbox(tick: int, message: str | None) -> None:
    out_dir = ROOT / "agents" / "human" / "outbox" / f"tik{tick}"
    out_dir.mkdir(parents=True, exist_ok=True)
    if message is not None:
        msg_file = out_dir / "input.txt"
        msg_file.write_text(message)
        print(f"[next_tick] Stored human message in {msg_file.relative_to(ROOT)}")


def advance_tick(human_message: str | None = None) -> int:
    """Advance the global tick; return new tick number."""
    state = _load_state()
    current = int(state.get("tick", 0))
    nxt = current + 1
    state["tick"] = nxt
    _save_state(state)

    _touch_cycles(nxt)
    _human_outbox(nxt, human_message)

    print(f"[next_tick] Advanced tick {current} → {nxt}")
    return nxt


def _cli() -> None:  # pragma: no cover
    parser = argparse.ArgumentParser(description="Advance Project Windsurf tick")
    parser.add_argument("-m", "--message", help="Human prompt to store for this tick")
    args = parser.parse_args()
    advance_tick(args.message)


if __name__ == "__main__":
    _cli()
