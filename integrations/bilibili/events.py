from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


@dataclass(frozen=True)
class BilibiliLiveEvent:
    id: str
    kind: str
    room_id: int
    username: str
    content: str
    created_at: str
    source_id: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


def normalize_event(payload: dict[str, Any], room_id: int) -> BilibiliLiveEvent | None:
    cmd = str(payload.get("cmd") or "").split(":", 1)[0]
    username = ""
    content = ""
    kind = ""
    if cmd == "DANMU_MSG":
        info = payload.get("info") or []
        try:
            raw_content = info[1]
            content = str(raw_content[0] if isinstance(raw_content, list) else raw_content).strip()
            user = info[2]
            username = str(user[1] if len(user) > 1 else user[0]).strip()
        except (IndexError, TypeError):
            return None
        kind = "danmaku"
    elif cmd == "INTERACT_WORD":
        data = payload.get("data") or {}
        username = str(data.get("uname") or "观众").strip()
        content = f"{username}进入了直播间"
        kind = "enter"
        room_id = int(data.get("roomid") or room_id)
    if not kind or not content:
        return None
    return BilibiliLiveEvent(
        id=str(uuid4()), kind=kind, room_id=int(room_id), username=username or "观众",
        content=content[:500], created_at=datetime.now(timezone.utc).isoformat(),
        source_id=str((payload.get("data") or {}).get("msg_id") or ""),
    )


def normalize_history_event(payload: dict[str, Any], room_id: int) -> BilibiliLiveEvent | None:
    username = str(payload.get("nickname") or payload.get("uname") or "观众").strip()
    content = str(payload.get("text") or payload.get("msg") or "").strip()
    if not content:
        return None
    timeline = str(payload.get("timeline") or "").strip()
    source_id = f"{timeline}|{username}|{content}"
    return BilibiliLiveEvent(
        id=str(uuid4()), kind="danmaku", room_id=int(room_id), username=username,
        content=content[:500], created_at=datetime.now(timezone.utc).isoformat(),
        source_id=source_id,
    )
