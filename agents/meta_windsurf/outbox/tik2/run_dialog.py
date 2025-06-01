#!/usr/bin/env python3
"""
meta_windsurf: Interactive runscript to start a tick dialog.
Prompts the user for the tick number and an optional kickoff message, then stores the kickoff in the correct agent outbox.
"""
import os
from pathlib import Path
import json
from datetime import datetime

def main():
    print("=== Project Windsurf Tick Dialog ===")
    tick = input("Enter tick number (e.g., 3): ").strip()
    if not tick.isdigit():
        print("Tick must be a number.")
        return
    tick = int(tick)
    kickoff = input(f"Enter kickoff message for tick {tick} (or leave blank): ").strip()
    # Store kickoff in human agent's outbox for this tick
    outbox_dir = Path(__file__).resolve().parent.parent.parent / "human" / "outbox" / f"tik{tick}"
    outbox_dir.mkdir(parents=True, exist_ok=True)
    kickoff_file = outbox_dir / "kickoff.txt"
    with open(kickoff_file, 'w') as f:
        f.write(f"Tick: {tick}\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n")
        f.write(f"Kickoff: {kickoff}\n")
    print(f"Kickoff message saved to {kickoff_file}")
    print("You may now proceed with meta-agent or actor-agent runs for this tick.")

if __name__ == "__main__":
    main()
