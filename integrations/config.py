from pathlib import Path

from extensions.storage import read_json, write_json


ONEBOT_DEFAULTS = {
    "enabled": False,
    "access_token": "",
    "group_trigger": "at",
    "prefix": "",
    "default_persona_id": "",
    "auto_reply_enabled": False,
    "auto_voice_reply": False,
    "voice_only": False,
    "chinese_text": False,
    "authorized_group_ids": [],
    "spontaneous_reply_probability": 0.05,
    "reply_mode": "text",
}

BILIBILI_DEFAULTS = {
    "room_id": "",
    "default_persona_id": "",
    "danmaku_enabled": True,
    "enter_enabled": True,
    "auto_voice": True,
    "cookie": "",
}


def load_integrations(path: Path) -> dict:
    return read_json(path)


def save_integrations(path: Path, data: dict) -> None:
    write_json(path, data)


def onebot_config(data: dict) -> dict:
    raw = data.get("onebot11") or {}
    config = dict(ONEBOT_DEFAULTS)
    config.update({key: raw.get(key, default) for key, default in ONEBOT_DEFAULTS.items()})
    if config["group_trigger"] not in {"at", "prefix"}:
        config["group_trigger"] = "at"
    if config["reply_mode"] not in {"text", "text_voice", "voice_only"}:
        config["reply_mode"] = (
            "voice_only" if config["voice_only"] else
            "text_voice" if config["auto_voice_reply"] else "text"
        )
    return config


def onebot_runtime_config(project_root: Path) -> dict:
    return onebot_config(load_integrations(project_root / "data" / "integrations.json"))


def bilibili_config(data: dict) -> dict:
    raw = data.get("bilibili") or {}
    return {key: raw.get(key, default) for key, default in BILIBILI_DEFAULTS.items()}


def bilibili_runtime_config(project_root: Path) -> dict:
    return bilibili_config(load_integrations(project_root / "data" / "integrations.json"))
