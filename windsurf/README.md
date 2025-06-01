# Project Windsurf

Bootstrap completed.

## Quick-start
```bash
python windsurf_bootstrap.py  # generates skeleton (idempotent)
python windsurf_runner.py     # prints current tick
```

Copy `.env.example` → `.env` and supply secrets.

## Tick Management

Add a helper CLI for advancing ticks:

```bash
python -m windsurf.next_tick -m "your prompt here"
```

This will:
1. Increment `windsurf/global_state.json`.
2. Stub out `agents/*/cycles/<tick>.json` files.
3. Create `agents/human/outbox/tik<tick>/input.txt` with your message.
