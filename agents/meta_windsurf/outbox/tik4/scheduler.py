#!/usr/bin/env python3
"""
Project Windsurf Tick Scheduler/Orchestrator
- Loads kickoff message for the current tick
- Iterates over all agents, loads system prompt and memory
- Prepares LLM input for each agent and (mock) calls the LLM
- Saves output to cycles/tikN.json and outbox/tikN/
- Prints/logs all actions for auditability

NOTE: This is a skeleton; LLM call is mocked for safety. Plug in your API logic as needed.
"""
import os
import json
from pathlib import Path
from datetime import datetime

TICK = 4  # Current tick
AGENTS_DIR = Path(__file__).resolve().parent.parent.parent
AGENT_LIST = [p.name for p in (AGENTS_DIR).iterdir() if p.is_dir() and not p.name.startswith('.')]

KICKOFF_PATH = AGENTS_DIR / "human" / "outbox" / f"tik{TICK}" / "kickoff.txt"
LOG_PATH = Path(__file__).parent / "scheduler.log"

def read_file(path):
    try:
        return path.read_text()
    except Exception as e:
        return f"[Missing: {path}]"

def mock_llm_call(agent, prompt, memory, kickoff):
    # Replace with real LLM call
    return {
        "thought": f"[{agent}] Analyzing kickoff: {kickoff[:60]}...",
        "action": f"[{agent}] Would send a message or perform a tool call.",
        "result": f"[{agent}] Completed reasoning for tick {TICK}."
    }

def main():
    print(f"=== Windsurf Tick Scheduler — TICK {TICK} ===")
    kickoff = read_file(KICKOFF_PATH)
    print(f"Kickoff: {kickoff.strip()[:120]}")
    for agent in AGENT_LIST:
        agent_dir = AGENTS_DIR / agent
        sys_prompt = read_file(agent_dir / "system_prompt.md")
        memory = read_file(agent_dir / "memory.md")
        # Compose LLM input (system prompt, memory, kickoff, prior cycles)
        llm_input = f"SYSTEM PROMPT:\n{sys_prompt}\nMEMORY:\n{memory}\nKICKOFF:\n{kickoff}\n"
        # Call LLM (mocked)
        output = mock_llm_call(agent, sys_prompt, memory, kickoff)
        # Save to cycles/tikN.json
        cycles_dir = agent_dir / "cycles"
        cycles_dir.mkdir(exist_ok=True)
        cycles_file = cycles_dir / f"{TICK}.json"
        with open(cycles_file, 'w') as f:
            json.dump(output, f, indent=2)
        # Save to outbox/tikN/
        outbox_dir = agent_dir / "outbox" / f"tik{TICK}"
        outbox_dir.mkdir(parents=True, exist_ok=True)
        outbox_msg = outbox_dir / "llm_output.txt"
        with open(outbox_msg, 'w') as f:
            f.write(f"Tick: {TICK}\nTimestamp: {datetime.now().isoformat()}\nAgent: {agent}\n\n")
            f.write(json.dumps(output, indent=2))
        # Log
        with open(LOG_PATH, 'a') as log:
            log.write(f"[{datetime.now().isoformat()}] {agent} processed for tick {TICK}\n")
        print(f"[✓] {agent} processed.")
    print(f"=== All agents processed for tick {TICK}. ===")

if __name__ == "__main__":
    main()
