#!/usr/bin/env python3
"""
Bootstrap script for Project Windsurf.

Creates the required directory skeleton, baseline config files, and
protocol stubs for tick-0. Idempotent—safe to run multiple times.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import textwrap
from pathlib import Path


# -------------------------------
# Constants & Configuration
# -------------------------------
CHAR_LIMIT = 8_000
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

# -------------------------------
# Helper Functions
# -------------------------------

def _write_file(path: Path, content: str, overwrite: bool = False) -> None:
    """Write *content* to *path*, creating parent dirs. Skip if exists unless **overwrite**."""
    if path.exists() and not overwrite:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# -------------------------------
# Individual Artifact Creators
# -------------------------------

def _global_state(windsurf_root: Path) -> None:
    pth = windsurf_root / "global_state.json"
    if pth.exists():
        return
    state = {"tick": 0, "status": "bootstrap", "configHash": ""}
    payload = json.dumps(state, sort_keys=True).encode()
    state["configHash"] = _sha256_bytes(payload)
    _write_file(pth, json.dumps(state, indent=2))


def _readme(windsurf_root: Path) -> None:
    pth = windsurf_root / "README.md"
    if pth.exists():
        return
    md = textwrap.dedent(
        """\
        # Project Windsurf

        Bootstrap completed.

        ## Quick-start
        ```bash
        python windsurf_bootstrap.py  # generates skeleton (idempotent)
        python windsurf_runner.py     # prints current tick
        ```

        Copy `.env.example` → `.env` and supply secrets.
        """
    )
    _write_file(pth, md)


def _requirements(repo_root: Path) -> None:
    pth = repo_root / "requirements.txt"
    if pth.exists():
        return
    req = textwrap.dedent(
        """\
        langchain>=0.1.14
        openai>=1.3.5
        tiktoken>=0.5.1
        pydantic>=2.6
        python-dotenv>=1.0
        toml>=0.10
        psycopg[binary]>=3.1
        pytest>=8.0
        """
    )
    _write_file(pth, req)


def _env_example(windsurf_root: Path) -> None:
    pth = windsurf_root / ".env.example"
    if pth.exists():
        return
    env = "WINDSURF_TICK_DURATION_SEC=30\nOPENAI_API_KEY=YOUR_KEY\nDATABASE_URL=postgresql://windsurf:windsurf@localhost:5432/windsurf\n"
    _write_file(pth, env)


def _agent_dirs(windsurf_root: Path) -> None:
    agents_dir = windsurf_root / "agents"
    for name in AGENT_ACTOR_NAMES + AGENT_META_NAMES + ["human"]:
        base = agents_dir / name
        for sub in ("inbox", "outbox", "cycles"):
            (base / sub).mkdir(parents=True, exist_ok=True)
        _write_file(base / "memory.md", "")


def _protocols(windsurf_root: Path) -> None:
    proto_dir = windsurf_root / "protocols"
    proto_dir.mkdir(parents=True, exist_ok=True)
    _write_file(proto_dir / "next_assignments.json", "{}")
    _write_file(proto_dir / "ACP.md", "# ACP v1.0 – to be completed\n")
    _write_file(proto_dir / "MCP.md", "# MCP v1.0 – to be completed\n")
    _write_file(
        proto_dir / "LLM_TIERS.md",
        textwrap.dedent(
            """\
            Tag | Examples | Typical Max Tokens | Cost | Use\n            ---|---|---|---|---\n            LLM-CHEAP | gpt-3.5-mini, Claude-Haiku | 8K | 0.00025 | trivial transforms\n            LLM-MEDIUM | gpt-4o-mini, Claude-Sonnet | 128K | 0.003 | normal tasks\n            LLM-HQ | gpt-4o, Claude-Opus | 128K | 0.01 | public docs\n            LLM-O3 | OpenAI o3 | 128K | 0.03 | strategy\n            LLM-O3-REASON | OpenAI o3 CoT | 128K | 0.03 | deep reasoning\n            """
        ),
    )


def _tools(windsurf_root: Path) -> None:
    tools_dir = windsurf_root / "tools"
    tools_dir.mkdir(parents=True, exist_ok=True)
    size_guard = tools_dir / "size_guard.py"
    if not size_guard.exists():
        code = textwrap.dedent('''\
"""Size guard utility - prevents oversized agent messages."""

CHAR_LIMIT = {CHAR_LIMIT}

def enforce(payload: str, *, is_file_overflow: bool = False, file_type_hint: str | None = None) -> None:  # noqa: D401,E501
    """Raise ValueError if *payload* violates Windsurf message size policy."""
    length = len(payload)
    if length <= CHAR_LIMIT:
        return
    if not is_file_overflow:
        raise ValueError(
            f"Payload size {{length}} exceeds {{CHAR_LIMIT}} chars without overflow flag."
        )
    if not file_type_hint:
        raise ValueError("Overflow flagged but file_type_hint missing.")
''').format(CHAR_LIMIT=CHAR_LIMIT)
        _write_file(size_guard, code)


def _runner(repo_root: Path) -> None:
    pth = repo_root / "windsurf_runner.py"
    if pth.exists():
        return
    code = textwrap.dedent(
        '''\
"""Minimal tick runner placeholder."""
import json
from pathlib import Path


def main() -> None:
    root = Path(__file__).parent / "windsurf"
    state = root / "global_state.json"
    if not state.exists():
        print("Run windsurf_bootstrap.py first.")
        return
    data = json.loads(state.read_text())
    print(f"Current tick: {data.get('tick')} status={data.get('status')}")

if __name__ == "__main__":  # pragma: no cover
    main()
'''
     )
    _write_file(pth, code)


# -------------------------------
# Bootstrap Orchestrator
# -------------------------------

def _bootstrap(repo_root: Path) -> None:
    windsurf_root = repo_root / "windsurf"
    windsurf_root.mkdir(exist_ok=True)

    _global_state(windsurf_root)
    _readme(windsurf_root)
    _requirements(repo_root)
    _env_example(windsurf_root)
    _agent_dirs(windsurf_root)
    _protocols(windsurf_root)
    _tools(windsurf_root)
    _runner(repo_root)
    print("[windsurf_bootstrap] Bootstrap complete at", windsurf_root)


# -------------------------------
# CLI Wrapper
# -------------------------------

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Bootstrap Project Windsurf directory skeleton")
    parser.add_argument("root", nargs="?", default=".", help="Project root (defaults to current directory)")
    return parser.parse_args()


def main(argv: list[str] | None = None) -> None:  # noqa: D401
    args = _parse_args()
    repo_root = Path(args.root).resolve()
    _bootstrap(repo_root)


if __name__ == "__main__":  # pragma: no cover
    main()
