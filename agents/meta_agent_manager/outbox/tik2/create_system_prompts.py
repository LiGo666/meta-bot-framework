#!/usr/bin/env python3
"""
Reads initial-system-prompts.txt and generates system_prompt.md for each agent.
Adds current tick, timestamp, and agent info to each outbox message created by bots.
"""
from pathlib import Path
import re
from datetime import datetime
import os

PROMPT_FILE = Path(__file__).resolve().parent.parent.parent / "outbox" / "tik1" / "initial-system-prompts.txt"
AGENTS_DIR = Path(__file__).resolve().parent.parent.parent.parent
TICK = 2  # as per user request

def parse_prompts(txt):
    agents = {}
    blocks = re.split(r'-{5,}', txt)
    for block in blocks:
        lines = [l.strip() for l in block.strip().splitlines() if l.strip()]
        if not lines:
            continue
        agent_id = None
        title = obj = func = succ = default = None
        for line in lines:
            if line.startswith('AGENT ID'):
                agent_id = line.split(':',1)[1].strip()
            elif line.startswith('TITLE'):
                title = line.split(':',1)[1].strip()
            elif line.startswith('DEFAULT'):
                default = line.split(':',1)[1].strip()
            elif line.startswith('OBJECTIVE'):
                obj = line.split(':',1)[1].strip()
            elif line.startswith('FUNCTION'):
                func = line.split(':',1)[1].strip()
            elif line.startswith('SUCCESS'):
                succ = line.split(':',1)[1].strip()
        if agent_id:
            agents[agent_id] = {
                'title': title,
                'default': default,
                'objective': obj,
                'function': func,
                'success': succ
            }
    return agents

def get_common_preamble():
    # Read the full common preamble from the top of initial-system-prompts.txt
    with open(PROMPT_FILE, 'r') as f:
        lines = []
        found = False
        for line in f:
            if line.strip().startswith('###  PROJECT WINDSURF'):
                found = True
            if found:
                # end at first agent block (AGENT ID or -----)
                if line.strip().startswith('AGENT ID') or (set(line.strip()) == {'-'} and len(line.strip()) >= 5):
                    break
                lines.append(line.rstrip('\n'))
        return '\n'.join(lines).strip() + '\n\n'

def write_prompts(agents):
    preamble = get_common_preamble()
    for agent, info in agents.items():
        agent_dir = AGENTS_DIR / agent
        if agent_dir.exists():
            prompt_path = agent_dir / "system_prompt.md"
            with open(prompt_path, 'w') as f:
                f.write(preamble)
                f.write(f"# {agent}\n\n")
                f.write(f"**Title:** {info['title']}\n\n")
                f.write(f"**LLM Default:** {info['default']}\n\n")
                f.write(f"**Objective:** {info['objective']}\n\n")
                f.write(f"**Function:** {info['function']}\n\n")
                f.write(f"**Success Metric:** {info['success']}\n\n")
                f.write(f"**Tick:** {TICK}\n")
                f.write(f"**Generated:** {datetime.now().isoformat()}\n")

def main():
    txt = PROMPT_FILE.read_text()
    agents = parse_prompts(txt)
    write_prompts(agents)
    print(f"[meta_agent_manager] system_prompt.md written for {len(agents)} agents.")

if __name__ == "__main__":
    main()
