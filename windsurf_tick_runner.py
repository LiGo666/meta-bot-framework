#!/usr/bin/env python3
"""
Project Windsurf – Full Tick Runner (Terminal GUI)
=================================================
Runs the 5-tick lifecycle end-to-end:
  Tick 1  – Human input
  Tick 2  – Meta-agent analysis of human input
  Tick 3  – Human prompt + meta analysis → meta routing (tasks for agents)
  Tick 4  – Actor-agent actions
  Tick 5  – Meta-agent review for the human

Usage:
  $ python3 windsurf_tick_runner.py
The script will determine the next required tick, guide you interactively when
human input is needed, and automatically call the LLM for the relevant agents.
Outputs are streamed to the console and persisted to the directory structure:
  agents/<id>/cycles/<tick>.json        – {thought, action, result}
  agents/<id>/outbox/tik<tick>/llm.txt  – raw LLM content

Requirements:
  • OPENAI_API_KEY in .env  (the bootstrap already created .env)
  • `openai` and `python-dotenv` python packages (in requirements.txt)
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from textwrap import indent

from dotenv import load_dotenv
import openai

# ---------------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent
GLOBAL_STATE = ROOT / "windsurf" / "global_state.json"
AGENTS_DIR = ROOT / "agents"
HUMAN_ID = "human"
META_AGENTS = [
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
ACTOR_AGENTS = [
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

LLM_MODEL_MAP = {
    "CHEAP": "gpt-4o-mini",       # Upgraded from gpt-3.5-turbo
    "MEDIUM": "gpt-4o",          # Upgraded to standard gpt-4o
    "HQ": "gpt-4o",              # Full gpt-4o
    "O3": "gpt-4o",              # Full gpt-4o
    "O3-REASON": "gpt-4o",       # Full gpt-4o
}
DEFAULT_MODEL = "gpt-4o-mini"    # Default upgraded to gpt-4o-mini

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def load_state() -> dict:
    if GLOBAL_STATE.exists():
        return json.loads(GLOBAL_STATE.read_text())
    return {"tick": 0}


def save_state(state: dict) -> None:
    GLOBAL_STATE.write_text(json.dumps(state, indent=2))


def choose_model(system_prompt: str) -> str:
    """Pick model based on **LLM Default:** tag inside system_prompt."""
    m = re.search(r"\*\*LLM Default:\*\*\s*([A-Z0-9\-]+)", system_prompt)
    tier = m.group(1).upper() if m else None
    model = LLM_MODEL_MAP.get(tier, DEFAULT_MODEL)
    if tier:
        print(f"  [MODEL] Found tag '{tier}' in system prompt, using model '{model}'")
    else:
        print(f"  [MODEL] No specific model tag found, using default model '{DEFAULT_MODEL}'")
    return model


def read_text(path: Path) -> str:
    try:
        return path.read_text()
    except FileNotFoundError:
        return ""


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def llm_call(model: str, messages: list[dict]) -> str:
    print(f"  [LLM REQUEST] Calling {model}...")
    print(f"  [LLM REQUEST] System prompt: {len(messages[0]['content'])} chars")
    print(f"  [LLM REQUEST] User content: {len(messages[1]['content'])} chars")
    print(f"  [LLM REQUEST] Waiting for response...")
    try:
        # Modern OpenAI API (>=1.0.0) - using the official example from GitHub
        client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            timeout=60.0  # 60 second timeout
        )
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            timeout=60.0  # 60 second timeout
        )
        content = completion.choices[0].message.content.strip()
        print(f"  [LLM RESPONSE] Received {len(content)} chars")
        return content
    except KeyboardInterrupt:
        print(f"  [LLM INTERRUPTED] User interrupted the API call")
        return "[INTERRUPTED] API call was interrupted by the user"
    except Exception as e:
        print(f"  [LLM ERROR] {e}")
        return f"[ERROR] {e}"


def gather_prev_outputs(target_tick: int) -> str:
    """Concatenate outbox messages from tick=N into a single string."""
    if target_tick < 1:
        return ""
    chunks = []
    for agent_dir in AGENTS_DIR.iterdir():
        out_dir = agent_dir / "outbox" / f"tik{target_tick}"
        if out_dir.exists():
            for f in out_dir.glob("*.txt"):
                chunks.append(f"# {agent_dir.name}/{f.name}\n" + read_text(f))
    return "\n\n".join(chunks)


# ---------------------------------------------------------------------------
# MAIN TICK LOGIC
# ---------------------------------------------------------------------------

def human_input(tick: int):
    print("\n=== HUMAN INPUT REQUIRED ===")
    prompt = input(f"Enter your prompt for tick {tick}: \n> ")
    out_dir = AGENTS_DIR / HUMAN_ID / "outbox" / f"tik{tick}"
    ensure_dir(out_dir)
    file = out_dir / "kickoff.txt"
    file.write_text(f"Tick: {tick}\nTimestamp: {datetime.now().isoformat()}\nPrompt: {prompt}\n")
    print(f"Saved human prompt to {file}\n")


def run_agents(tick: int, agent_list: list[str], user_content: str):
    print(f"\n=== PROCESSING {len(agent_list)} AGENTS FOR TICK {tick} ===\n")
    print(f"Input content: {len(user_content)} characters")
    print(f"Agents to process: {', '.join(agent_list)}\n")
    
    for i, agent in enumerate(agent_list):
        agent_dir = AGENTS_DIR / agent
        sys_prompt = read_text(agent_dir / "system_prompt.md")
        memory = read_text(agent_dir / "memory.md")
        model = choose_model(sys_prompt)
        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user_content + "\n\nMEMORY:\n" + memory},
        ]
        print(f"\n[{i+1}/{len(agent_list)}] PROCESSING {agent} — model: {model}")
        
        # Make the LLM call
        reply = llm_call(model, messages)
        
        # Show the response
        print(f"\n[OUTPUT] {agent} response:")
        print(indent(reply[:500], "    "))
        if len(reply) > 500:
            print(f"    ... (truncated, {len(reply)} total chars)")
        
        # Persist to files
        print(f"[SAVING] Writing output to cycles/{tick}.json and outbox/tik{tick}/llm.txt")
        cycles_dir = agent_dir / "cycles"
        ensure_dir(cycles_dir)
        with open(cycles_dir / f"{tick}.json", "w") as f:
            json.dump({"thought_action_result": reply}, f, indent=2)
        out_dir = agent_dir / "outbox" / f"tik{tick}"
        ensure_dir(out_dir)
        (out_dir / "llm.txt").write_text(reply)
        print(f"[DONE] {agent} processing complete\n")


def main():
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not set in environment or .env — aborting.")
        sys.exit(1)
    print(f"[SETUP] Found OpenAI API key: {api_key[:4]}...{api_key[-4:]}")
    # No need to set global openai.api_key as we're using the client directly

    state = load_state()
    tick = state.get("tick", 0) + 1  # advance to next tick
    stage = (tick - 1) % 5 + 1  # 1..5

    print("""
==============================
   PROJECT WINDSURF TICK RUNNER
==============================""")
    print(f"Current tick → {tick}  (Stage {stage})\n")

    # ------------------------------------------------------------------
    if stage in (1, 3):  # human input stages
        human_input(tick)
        print("Human input captured. Re-run the tick runner to continue.")
    elif stage == 2:  # meta-agent analysis
        kickoff = gather_prev_outputs(tick - 1)  # human prompt
        run_agents(tick, META_AGENTS, kickoff)
    elif stage == 4:  # actor-agent actions
        routing = gather_prev_outputs(tick - 1)  # meta routing outputs
        run_agents(tick, ACTOR_AGENTS, routing)
    elif stage == 5:  # meta-agent review
        actor_outputs = gather_prev_outputs(tick - 1)
        run_agents(tick, META_AGENTS, actor_outputs)
    else:
        print("Unknown stage – nothing to do.")

    # ------------------------------------------------------------------
    state["tick"] = tick
    save_state(state)
    print("\n✔ Tick processing finished. You may run this script again for the next stage.")


if __name__ == "__main__":
    main()
