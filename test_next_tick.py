from pathlib import Path
import json
import subprocess
import sys


def test_next_tick_advances(tmp_path: Path):
    repo = tmp_path
    from shutil import copy2
    import distutils.dir_util

    project_root = Path(__file__).resolve().parent
    copy2(project_root / "windsurf_bootstrap.py", repo / "windsurf_bootstrap.py")
    distutils.dir_util.copy_tree((project_root / "windsurf").as_posix(), (repo / "windsurf").as_posix())

    subprocess.check_call([sys.executable, "windsurf_bootstrap.py", repo.as_posix()], cwd=repo)
    subprocess.check_call([
        sys.executable, "-m", "windsurf.next_tick", "-m", "hello world"], cwd=repo)

    state = json.loads((repo / "windsurf" / "global_state.json").read_text())
    assert state["tick"] == 1
    msg = (repo / "windsurf" / "agents" / "human" / "outbox" / "tik1" / "input.txt").read_text()
    assert msg == "hello world"
