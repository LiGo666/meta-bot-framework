# Windsurf Tick Viewer

A powerful tool for inspecting and analyzing the outputs of the Windsurf Tick Runner system.

## Features

- **Detailed View**: View all outputs from any tick with content formatting
- **Summary View**: Get a quick overview of agent activities in any tick
- **Comparison Tool**: Compare outputs between any two ticks
- **Content Formatting**: Automatic detection and formatting of different content types (JSON, YAML, Markdown)
- **Color-Coded Output**: Easy-to-read terminal output with color highlighting

## Usage

```bash
# View detailed output for the current tick
python3 windsurf_tick_viewer.py

# View detailed output for a specific tick
python3 windsurf_tick_viewer.py 5

# View the latest tick
python3 windsurf_tick_viewer.py latest

# Show a summary of a specific tick
python3 windsurf_tick_viewer.py summary 3

# Show a summary of the latest tick
python3 windsurf_tick_viewer.py summary latest

# Compare outputs between two ticks
python3 windsurf_tick_viewer.py compare 2 3

# Compare a specific tick with the latest tick
python3 windsurf_tick_viewer.py compare 5 latest

# Show help information
python3 windsurf_tick_viewer.py help
```

## Output Types

The viewer displays different types of files:

- **Cycle Files**: JSON files containing the agent's thought, action, and result for a tick
- **Outbox Files**: Files created by an agent during a tick
- **Inbox Files**: Files received by an agent during a tick

## Content Formatting

The viewer automatically detects and formats different content types:

- **JSON**: Pretty-printed with proper indentation
- **YAML**: Displayed with syntax highlighting
- **Markdown**: Displayed with proper formatting
- **Text**: Displayed as plain text

## Testing

A comprehensive test script is included to verify all features:

```bash
python3 test_tick_viewer.py
```

This will run through all the viewer's features and display their outputs.

## Integration with Tick Runner

The Tick Viewer works seamlessly with the Windsurf Tick Runner system, reading from the same directory structure and file formats. It's designed to be a companion tool for debugging and monitoring the tick lifecycle.
