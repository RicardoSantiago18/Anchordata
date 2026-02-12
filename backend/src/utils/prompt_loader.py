from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SYSTEM_PROMPTS_DIR = BASE_DIR / "system_prompts"


def load_system_prompt(filename: str) -> str:
    file_path = SYSTEM_PROMPTS_DIR / filename

    if not file_path.exists():
        raise FileNotFoundError(f"Prompt não encontrado: {file_path}")
    
    return file_path.read_text(encoding="utf-8")
    