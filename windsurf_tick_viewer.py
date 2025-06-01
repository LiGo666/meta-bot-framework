#!/usr/bin/env python3
"""
Windsurf Tick Viewer - A tool to view the outputs from the last tick in a structured way
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
import textwrap
from typing import Dict, List, Optional, Any, Tuple

# Constants
AGENTS_DIR = Path("agents")
GLOBAL_STATE = Path("windsurf/global_state.json")
MAX_CONTENT_PREVIEW = 500  # Maximum characters to show in content preview

# ANSI colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def load_state() -> dict:
    """Load the global state."""
    try:
        return json.loads(GLOBAL_STATE.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {"tick": 0}

def get_agent_dirs() -> List[Path]:
    """Get all agent directories."""
    return [p for p in AGENTS_DIR.iterdir() if p.is_dir()]

def get_agent_name(agent_dir: Path) -> str:
    """Get the agent name from its directory."""
    return agent_dir.name

def get_tick_files(agent_dir: Path, tick: int) -> Dict[str, Path]:
    """Get all files related to a specific tick for an agent."""
    files = {}
    
    # Check cycles directory
    cycle_file = agent_dir / "cycles" / f"{tick}.json"
    if cycle_file.exists():
        files["cycle"] = cycle_file
    
    # Check outbox directory
    outbox_dir = agent_dir / "outbox" / f"tik{tick}"
    if outbox_dir.exists():
        for file in outbox_dir.iterdir():
            if file.is_file():
                files[f"outbox/{file.name}"] = file
    
    # Check inbox directory
    inbox_dir = agent_dir / "inbox" / f"tik{tick}"
    if inbox_dir.exists():
        for file in inbox_dir.iterdir():
            if file.is_file():
                files[f"inbox/{file.name}"] = file
    
    return files

def detect_content_type(content: str, file_name: str) -> str:
    """Detect the type of content based on file name and content."""
    if file_name.endswith('.json'):
        return 'json'
    elif file_name.endswith('.yaml') or file_name.endswith('.yml'):
        return 'yaml'
    elif file_name.endswith('.md'):
        return 'markdown'
    
    # Try to detect from content
    if content.strip().startswith('{') and content.strip().endswith('}'):
        try:
            json.loads(content)
            return 'json'
        except json.JSONDecodeError:
            pass
    
    if content.strip().startswith('```json'):
        return 'json'
    elif content.strip().startswith('```yaml'):
        return 'yaml'
    elif content.strip().startswith('```md') or content.strip().startswith('```markdown'):
        return 'markdown'
    elif content.strip().startswith('#'):
        return 'markdown'
    
    return 'text'

def format_content(content: str, file_name: str = '', max_length: int = MAX_CONTENT_PREVIEW) -> str:
    """Format content for display with proper indentation and truncation."""
    if not content:
        return "No content"
    
    # Detect content type
    content_type = detect_content_type(content, file_name)
    
    # Process content based on type
    if content_type == 'json':
        # Try to pretty-print JSON
        try:
            # If content is wrapped in ```json, extract it
            if content.strip().startswith('```json') and content.strip().endswith('```'):
                json_content = content.strip()[7:-3].strip()
            else:
                json_content = content
                
            parsed = json.loads(json_content)
            content = json.dumps(parsed, indent=2)
        except json.JSONDecodeError:
            # If we can't parse it, just use the original content
            pass
    
    # Truncate if too long
    if len(content) > max_length:
        content = content[:max_length] + "... (truncated)"
    
    # Add content type indicator
    formatted = f"{Colors.YELLOW}[{content_type.upper()}]{Colors.ENDC}\n"
    
    # Indent all lines
    return formatted + textwrap.indent(content, "    ")

def print_agent_tick_info(agent_name: str, tick: int, files: Dict[str, Path]):
    """Print information about an agent's tick files."""
    print(f"{Colors.BOLD}{Colors.BLUE}=== {agent_name} ==={Colors.ENDC}")
    
    if not files:
        print(f"  {Colors.YELLOW}No files for tick {tick}{Colors.ENDC}")
        return
    
    # Process cycle file first if it exists
    if "cycle" in files:
        try:
            cycle_data = json.loads(files["cycle"].read_text())
            print(f"  {Colors.CYAN}[CYCLE]{Colors.ENDC}")
            if "thought_action_result" in cycle_data:
                content = cycle_data["thought_action_result"]
                print(f"{Colors.GREEN}  Content:{Colors.ENDC}")
                print(format_content(content, "cycle.json"))
            else:
                print(f"  {Colors.YELLOW}No thought_action_result in cycle data{Colors.ENDC}")
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"  {Colors.RED}Error reading cycle file: {e}{Colors.ENDC}")
    
    # Process outbox files
    outbox_files = {k: v for k, v in files.items() if k.startswith("outbox/")}
    if outbox_files:
        print(f"\n  {Colors.CYAN}[OUTBOX]{Colors.ENDC}")
        for file_key, file_path in outbox_files.items():
            file_name = file_key.split("/")[-1]
            print(f"  {Colors.GREEN}{file_name}:{Colors.ENDC}")
            try:
                content = file_path.read_text()
                print(format_content(content, file_name))
            except FileNotFoundError:
                print(f"    {Colors.RED}File not found{Colors.ENDC}")
    
    # Process inbox files
    inbox_files = {k: v for k, v in files.items() if k.startswith("inbox/")}
    if inbox_files:
        print(f"\n  {Colors.CYAN}[INBOX]{Colors.ENDC}")
        for file_key, file_path in inbox_files.items():
            file_name = file_key.split("/")[-1]
            print(f"  {Colors.GREEN}{file_name}:{Colors.ENDC}")
            try:
                content = file_path.read_text()
                print(format_content(content, file_name))
            except FileNotFoundError:
                print(f"    {Colors.RED}File not found{Colors.ENDC}")
    
    print()  # Empty line between agents

def view_tick(tick: Optional[int] = None):
    """View all agent outputs for a specific tick."""
    state = load_state()
    current_tick = state.get("tick", 0)
    
    if tick is None:
        tick = current_tick
    
    print(f"{Colors.HEADER}{Colors.BOLD}PROJECT WINDSURF - TICK {tick} VIEWER{Colors.ENDC}")
    print(f"{Colors.YELLOW}Current global tick: {current_tick}{Colors.ENDC}")
    print(f"{Colors.YELLOW}Viewing tick: {tick}{Colors.ENDC}")
    print()
    
    agent_dirs = get_agent_dirs()
    for agent_dir in sorted(agent_dirs):
        agent_name = get_agent_name(agent_dir)
        files = get_tick_files(agent_dir, tick)
        if files:  # Only show agents with files for this tick
            print_agent_tick_info(agent_name, tick, files)

def view_tick_summary(tick: int):
    """View a summary of all agent outputs for a specific tick."""
    state = load_state()
    current_tick = state.get("tick", 0)
    
    print(f"{Colors.HEADER}{Colors.BOLD}PROJECT WINDSURF - TICK {tick} SUMMARY{Colors.ENDC}")
    print(f"{Colors.YELLOW}Current global tick: {current_tick}{Colors.ENDC}")
    print(f"{Colors.YELLOW}Viewing tick: {tick}{Colors.ENDC}")
    print()
    
    agent_dirs = get_agent_dirs()
    agent_count = 0
    file_counts = {"cycle": 0, "outbox": 0, "inbox": 0}
    
    for agent_dir in sorted(agent_dirs):
        agent_name = get_agent_name(agent_dir)
        files = get_tick_files(agent_dir, tick)
        
        if files:
            agent_count += 1
            if "cycle" in files:
                file_counts["cycle"] += 1
            
            outbox_count = len([k for k in files.keys() if k.startswith("outbox/")])
            inbox_count = len([k for k in files.keys() if k.startswith("inbox/")])
            
            file_counts["outbox"] += outbox_count
            file_counts["inbox"] += inbox_count
            
            print(f"{Colors.BOLD}{agent_name}{Colors.ENDC}: ", end="")
            parts = []
            if "cycle" in files:
                parts.append(f"{Colors.CYAN}cycle{Colors.ENDC}")
            if outbox_count > 0:
                parts.append(f"{Colors.GREEN}outbox({outbox_count}){Colors.ENDC}")
            if inbox_count > 0:
                parts.append(f"{Colors.BLUE}inbox({inbox_count}){Colors.ENDC}")
            
            print(", ".join(parts))
    
    print(f"\n{Colors.BOLD}Summary:{Colors.ENDC}")
    print(f"  Agents with activity: {agent_count}")
    print(f"  Cycle files: {file_counts['cycle']}")
    print(f"  Outbox files: {file_counts['outbox']}")
    print(f"  Inbox files: {file_counts['inbox']}")

def compare_ticks(tick1: int, tick2: int):
    """Compare two ticks side by side."""
    state = load_state()
    current_tick = state.get("tick", 0)
    
    print(f"{Colors.HEADER}{Colors.BOLD}PROJECT WINDSURF - TICK COMPARISON{Colors.ENDC}")
    print(f"{Colors.YELLOW}Current global tick: {current_tick}{Colors.ENDC}")
    print(f"{Colors.YELLOW}Comparing ticks: {tick1} vs {tick2}{Colors.ENDC}")
    print()
    
    agent_dirs = get_agent_dirs()
    for agent_dir in sorted(agent_dirs):
        agent_name = get_agent_name(agent_dir)
        files1 = get_tick_files(agent_dir, tick1)
        files2 = get_tick_files(agent_dir, tick2)
        
        if files1 or files2:
            print(f"{Colors.BOLD}{Colors.BLUE}=== {agent_name} ==={Colors.ENDC}")
            
            # Compare cycle files
            if "cycle" in files1 or "cycle" in files2:
                print(f"  {Colors.CYAN}[CYCLE]{Colors.ENDC}")
                
                if "cycle" in files1 and "cycle" in files2:
                    try:
                        data1 = json.loads(files1["cycle"].read_text())
                        data2 = json.loads(files2["cycle"].read_text())
                        
                        if "thought_action_result" in data1 and "thought_action_result" in data2:
                            content1 = data1["thought_action_result"]
                            content2 = data2["thought_action_result"]
                            
                            # Just show if they're different or same
                            if content1 == content2:
                                print(f"    {Colors.GREEN}Content is identical{Colors.ENDC}")
                            else:
                                print(f"    {Colors.YELLOW}Content differs{Colors.ENDC}")
                    except (json.JSONDecodeError, FileNotFoundError):
                        print(f"    {Colors.RED}Error comparing cycle files{Colors.ENDC}")
                else:
                    if "cycle" in files1:
                        print(f"    {Colors.YELLOW}Only in tick {tick1}{Colors.ENDC}")
                    else:
                        print(f"    {Colors.YELLOW}Only in tick {tick2}{Colors.ENDC}")
            
            # Compare outbox files
            outbox1 = {k.split("/")[-1]: v for k, v in files1.items() if k.startswith("outbox/")}
            outbox2 = {k.split("/")[-1]: v for k, v in files2.items() if k.startswith("outbox/")}
            
            if outbox1 or outbox2:
                print(f"\n  {Colors.CYAN}[OUTBOX]{Colors.ENDC}")
                all_files = sorted(set(list(outbox1.keys()) + list(outbox2.keys())))
                
                for file_name in all_files:
                    if file_name in outbox1 and file_name in outbox2:
                        try:
                            content1 = outbox1[file_name].read_text()
                            content2 = outbox2[file_name].read_text()
                            
                            if content1 == content2:
                                print(f"    {file_name}: {Colors.GREEN}Identical{Colors.ENDC}")
                            else:
                                print(f"    {file_name}: {Colors.YELLOW}Different{Colors.ENDC}")
                        except FileNotFoundError:
                            print(f"    {file_name}: {Colors.RED}Error reading{Colors.ENDC}")
                    else:
                        if file_name in outbox1:
                            print(f"    {file_name}: {Colors.YELLOW}Only in tick {tick1}{Colors.ENDC}")
                        else:
                            print(f"    {file_name}: {Colors.YELLOW}Only in tick {tick2}{Colors.ENDC}")
            
            print()  # Empty line between agents

def print_help():
    """Print help information for the tick viewer."""
    print(f"{Colors.HEADER}{Colors.BOLD}PROJECT WINDSURF - TICK VIEWER HELP{Colors.ENDC}\n")
    print(f"Usage: {sys.argv[0]} [command] [arguments]\n")
    print(f"Commands:")
    print(f"  {Colors.BOLD}help{Colors.ENDC}                    Show this help message")
    print(f"  {Colors.BOLD}<tick_number>{Colors.ENDC}            View detailed output for the specified tick")
    print(f"  {Colors.BOLD}summary <tick_number>{Colors.ENDC}    Show a summary of all agent outputs for the specified tick")
    print(f"  {Colors.BOLD}compare <tick1> <tick2>{Colors.ENDC}  Compare outputs between two ticks")
    print(f"  {Colors.BOLD}latest{Colors.ENDC}                  View detailed output for the latest tick")
    print(f"\nExamples:")
    print(f"  {sys.argv[0]} 5                 # View all outputs for tick 5")
    print(f"  {sys.argv[0]} summary 3         # Show summary of tick 3")
    print(f"  {sys.argv[0]} compare 2 3       # Compare outputs between ticks 2 and 3")
    print(f"  {sys.argv[0]} latest            # View the latest tick")

def main():
    """Main function to parse arguments and run the viewer."""
    # Load current tick from global state
    state = load_state()
    current_tick = state.get("tick", 0)
    
    if len(sys.argv) > 1:
        # Check for special commands
        if sys.argv[1] == "help" or sys.argv[1] == "-h" or sys.argv[1] == "--help":
            print_help()
            return
        elif sys.argv[1] == "summary" and len(sys.argv) > 2:
            if sys.argv[2] == "latest":
                view_tick_summary(current_tick)
                return
            try:
                tick = int(sys.argv[2])
                view_tick_summary(tick)
                return
            except ValueError:
                print(f"{Colors.RED}Error: Tick must be an integer or 'latest'{Colors.ENDC}")
                sys.exit(1)
        elif sys.argv[1] == "compare" and len(sys.argv) > 3:
            tick1 = sys.argv[2]
            tick2 = sys.argv[3]
            
            # Handle 'latest' keyword for first tick
            if tick1 == "latest":
                tick1 = current_tick
            else:
                try:
                    tick1 = int(tick1)
                except ValueError:
                    print(f"{Colors.RED}Error: Ticks must be integers or 'latest'{Colors.ENDC}")
                    sys.exit(1)
            
            # Handle 'latest' keyword for second tick
            if tick2 == "latest":
                tick2 = current_tick
            else:
                try:
                    tick2 = int(tick2)
                except ValueError:
                    print(f"{Colors.RED}Error: Ticks must be integers or 'latest'{Colors.ENDC}")
                    sys.exit(1)
            
            compare_ticks(tick1, tick2)
            return
        elif sys.argv[1] == "latest":
            view_tick(current_tick)
            return
        else:
            try:
                tick = int(sys.argv[1])
                view_tick(tick)
                return
            except ValueError:
                print(f"{Colors.RED}Error: Invalid command or tick number{Colors.ENDC}")
                print_help()
                sys.exit(1)
    
    # Default: view current tick
    view_tick(current_tick)

if __name__ == "__main__":
    main()
