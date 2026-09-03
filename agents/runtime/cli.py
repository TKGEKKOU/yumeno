from __future__ import annotations

import argparse
import os
import sys
from typing import Sequence


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="yumeno", description="YUMENO 统一运行入口")
    sub = parser.add_subparsers(dest="command")
    serve = sub.add_parser("serve", help="启动 Web 服务")
    serve.add_argument("--host", default=None)
    serve.add_argument("--port", type=int, default=None)
    sub.add_parser("runtime-status", help="查看内置 Agent 运行内核状态")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    command = args.command or "serve"
    if command == "runtime-status":
        import json
        print(json.dumps({
            "engine": "yumeno-native",
            "external_runtime_required": False,
            "session_job_event_cancel_resume": True,
            "service": "Core → Supervisor → Worker",
        }, ensure_ascii=False, indent=2))
        return 0
    if command == "serve":
        import uvicorn
        from app.main import create_app
        from settings import Settings
        settings = Settings.load()
        host = args.host or settings.app_host
        port = args.port or settings.app_port
        uvicorn.run(create_app(), host=host, port=port)
        return 0
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
