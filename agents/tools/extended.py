"""扩展工具集：URL 导入、对话导出等"""
from __future__ import annotations
import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Any
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command

from agents.context import PersonaAgentContext
from agents.tools.management import request_confirmation

logger = logging.getLogger(__name__)


@tool
def import_knowledge_from_url(
    url: str,
    description: str,
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    从 URL 爬取内容并添加到角色知识库（需 HITL 确认）。
    
    Args:
        url: 要导入的网页 URL
        description: 对这份资料的描述
    
    Returns:
        导入结果
    """
    # 触发 HITL 确认
    approved = request_confirmation({
        "type": "import_url",
        "tool": "import_knowledge_from_url",
        "title": f"从 URL 导入知识：{url}",
        "params": {
            "url": url,
            "description": description,
            "persona": runtime.context.persona_name
        },
        "message": f"将爬取 {url} 的内容并添加到 {runtime.context.persona_name} 的知识库中。是否继续？",
        "risk_level": "medium"
    })
    
    if not approved:
        return {
            "status": "cancelled",
            "reason": "用户取消操作"
        }
    
    try:
        from ingestion.web_crawler import crawl_and_parse
        from ingestion.document_jobs import create_document_job
        
        # 爬取内容
        content = crawl_and_parse(url)
        
        if not content or len(content.strip()) < 100:
            return {
                "status": "failed",
                "reason": "爬取的内容过短或为空，可能是防爬或页面结构不支持"
            }
        
        # 创建文档任务
        job = create_document_job(
            persona_id=runtime.context.persona_id,
            workspace=runtime.context.workspace,
            knowledge_space=runtime.context.knowledge_space,
            content=content,
            title=description or url,
            source_url=url
        )
        
        logger.info(f"Created document job {job.id} from URL {url}")
        
        return {
            "status": "success",
            "job_id": job.id,
            "content_length": len(content),
            "message": f"已成功导入 {len(content)} 字符的内容到知识库"
        }
        
    except Exception as e:
        logger.error(f"Failed to import from URL {url}: {e}")
        return {
            "status": "failed",
            "reason": str(e)
        }


@tool
def export_conversation(
    conversation_id: str,
    format: str = "json",
    runtime: ToolRuntime[PersonaAgentContext] = None
) -> dict[str, Any]:
    """
    导出对话历史为文件。
    
    Args:
        conversation_id: 对话 ID
        format: 导出格式（json/txt/markdown）
    
    Returns:
        导出结果和文件路径
    """
    try:
        from app.models import Conversation, Message
        from agents.tools.management import _session
        
        session = _session(runtime.context)
        
        # 查询对话
        conversation = session.query(Conversation).filter_by(
            id=conversation_id
        ).first()
        
        if not conversation:
            return {
                "status": "not_found",
                "reason": f"找不到对话 {conversation_id}"
            }
        
        # 权限检查
        if conversation.persona_id != runtime.context.persona_id:
            return {
                "status": "denied",
                "reason": "只能导出当前角色的对话"
            }
        
        # 查询消息
        messages = session.query(Message).filter_by(
            conversation_id=conversation_id
        ).order_by(Message.created_at).all()
        
        # 导出目录
        export_dir = Path("data/exports")
        export_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"conversation_{conversation_id}_{timestamp}"
        
        if format == "json":
            filepath = export_dir / f"{filename}.json"
            data = {
                "conversation_id": conversation_id,
                "persona_name": conversation.persona.name,
                "created_at": conversation.created_at.isoformat(),
                "message_count": len(messages),
                "messages": [
                    {
                        "role": msg.role,
                        "content": msg.content,
                        "timestamp": msg.created_at.isoformat()
                    }
                    for msg in messages
                ]
            }
            filepath.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            
        elif format == "txt":
            filepath = export_dir / f"{filename}.txt"
            lines = [f"对话导出 - {conversation.persona.name}", "=" * 50, ""]
            for msg in messages:
                role_label = "用户" if msg.role == "user" else conversation.persona.name
                timestamp = msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
                lines.append(f"[{timestamp}] {role_label}:")
                lines.append(msg.content)
                lines.append("")
            filepath.write_text("\n".join(lines), encoding="utf-8")
            
        elif format == "markdown":
            filepath = export_dir / f"{filename}.md"
            lines = [
                f"# 对话记录 - {conversation.persona.name}",
                "",
                f"**对话 ID**: {conversation_id}",
                f"**创建时间**: {conversation.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
                f"**消息数**: {len(messages)}",
                "",
                "---",
                ""
            ]
            for msg in messages:
                role_label = "🧑 用户" if msg.role == "user" else f"🤖 {conversation.persona.name}"
                timestamp = msg.created_at.strftime("%H:%M:%S")
                lines.append(f"### {role_label} `{timestamp}`")
                lines.append("")
                lines.append(msg.content)
                lines.append("")
            filepath.write_text("\n".join(lines), encoding="utf-8")
            
        else:
            return {
                "status": "invalid_format",
                "reason": f"不支持的格式：{format}，支持 json/txt/markdown"
            }
        
        logger.info(f"Exported conversation {conversation_id} to {filepath}")
        
        return {
            "status": "success",
            "filepath": str(filepath.absolute()),
            "format": format,
            "message_count": len(messages),
            "file_size_kb": filepath.stat().st_size // 1024
        }
        
    except Exception as e:
        logger.error(f"Failed to export conversation: {e}")
        return {
            "status": "failed",
            "reason": str(e)
        }
