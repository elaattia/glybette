from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv

_MARKERS = ("pnpm-workspace.yaml", "pnpm-workspace.yml")

_loaded = False


def _find_repo_root() -> Path | None:
    start = Path(__file__).resolve().parent
    cwd = Path.cwd().resolve()
    for base in (start, *start.parents, cwd, *cwd.parents):
        if any((base / name).is_file() for name in _MARKERS):
            return base
    return None


def load_root_env() -> None:
    global _loaded
    if _loaded:
        return
    root = _find_repo_root()
    if root is not None:
        env_path = root / ".env"
        if env_path.is_file():
            load_dotenv(env_path, override=False)
    _loaded = True
