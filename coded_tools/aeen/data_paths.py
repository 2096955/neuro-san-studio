import os
from pathlib import Path

DEFAULT_AEEN_DATA_ROOT = Path(__file__).resolve().parents[2] / "data" / "aeen"


def aeen_data_root() -> Path:
    env_root = os.getenv("AEEN_DATA_ROOT")
    if env_root:
        return Path(env_root).expanduser().resolve()
    return DEFAULT_AEEN_DATA_ROOT.resolve()
