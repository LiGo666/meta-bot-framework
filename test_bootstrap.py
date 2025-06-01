"""Pytest covering windsurf_bootstrap basic expectations."""
from pathlib import Path
import json
import subprocess
import sys


def test_bootstrap(tmp_path: Path):
    repo = tmp_path
    src = Path(__file__).parent / "windsurf_bootstrap.py"
    (repo / "windsurf_bootstrap.py").write_text(src.read_text())

    subprocess.check_call([sys.executable, "windsurf_bootstrap.py", repo.as_posix()], cwd=repo)

    windsurf = repo / "windsurf"
    assert windsurf.exists()
    gstate = json.loads((windsurf / "global_state.json").read_text())
    assert gstate["tick"] == 0
    assert (repo / "requirements.txt").exists()

    out = subprocess.check_output([sys.executable, "windsurf_runner.py"], cwd=repo)
    assert b"Current tick: 0" in out
