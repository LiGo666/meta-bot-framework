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
