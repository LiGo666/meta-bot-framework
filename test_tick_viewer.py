#!/usr/bin/env python3
"""
Comprehensive test for the Windsurf Tick Viewer
This script tests all the features of the tick viewer by running various commands
and displaying their outputs.
"""

import os
import sys
import subprocess
import time
from colorama import Fore, Style, init

# Initialize colorama
init()

def print_header(text):
    """Print a formatted header."""
    print(f"\n{Fore.CYAN}{Style.BRIGHT}{'=' * 80}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{Style.BRIGHT}{text.center(80)}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{Style.BRIGHT}{'=' * 80}{Style.RESET_ALL}\n")

def run_command(command, description=None):
    """Run a command and print its output."""
    if description:
        print(f"{Fore.YELLOW}{Style.BRIGHT}TEST: {description}{Style.RESET_ALL}")
    
    print(f"{Fore.GREEN}$ {command}{Style.RESET_ALL}")
    print("-" * 80)
    
    # Run the command
    process = subprocess.Popen(
        command, 
        shell=True, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE,
        universal_newlines=True
    )
    
    stdout, stderr = process.communicate()
    
    # Print output
    if stdout:
        print(stdout)
    
    # Print errors if any
    if stderr:
        print(f"{Fore.RED}{stderr}{Style.RESET_ALL}")
    
    print("-" * 80)
    print(f"{Fore.GREEN}Exit code: {process.returncode}{Style.RESET_ALL}")
    print()
    
    # Small delay to make output more readable
    time.sleep(0.5)
    
    return process.returncode

def main():
    """Run all tests."""
    print_header("WINDSURF TICK VIEWER TEST SUITE")
    
    # Get the current directory
    current_dir = os.getcwd()
    viewer_script = os.path.join(current_dir, "windsurf_tick_viewer.py")
    
    # Test 1: Help command
    run_command(f"python3 {viewer_script} help", "Help Command")
    
    # Test 2: View latest tick
    run_command(f"python3 {viewer_script} latest", "View Latest Tick")
    
    # Test 3: View specific tick
    run_command(f"python3 {viewer_script} 6", "View Specific Tick (Tick 6)")
    
    # Test 4: Summary view of latest tick
    run_command(f"python3 {viewer_script} summary latest", "Summary of Latest Tick")
    
    # Test 5: Summary view of specific tick
    run_command(f"python3 {viewer_script} summary 6", "Summary of Specific Tick (Tick 6)")
    
    # Test 6: Compare two ticks
    run_command(f"python3 {viewer_script} compare 6 7", "Compare Ticks 6 and 7")
    
    # Test 7: Compare with latest
    run_command(f"python3 {viewer_script} compare 6 latest", "Compare Tick 6 with Latest")
    
    # Test 8: Invalid command (should show help)
    run_command(f"python3 {viewer_script} invalid_command", "Invalid Command Test")
    
    # Test 9: Invalid tick number
    run_command(f"python3 {viewer_script} abc", "Invalid Tick Number Test")
    
    print_header("TEST SUITE COMPLETED")
    print(f"{Fore.GREEN}{Style.BRIGHT}All tests have been executed.{Style.RESET_ALL}")
    print(f"Review the outputs above to verify that the tick viewer is functioning correctly.")
    print(f"The test covered: help, viewing ticks, summaries, comparisons, and error handling.")

if __name__ == "__main__":
    main()
