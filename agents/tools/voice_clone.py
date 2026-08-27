"""语音克隆 Worker 工具集"""
from __future__ import annotations
import logging
from typing import Any
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command

from agents.context import PersonaAgentContext

logger = logging.getLogger(__name__)


@tool
def start_voice_clone_session(
    persona_id: str,
    voice_description: str,
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    为角色创建语音克隆会话。
    
    Args:
        persona_id: 角色 ID
        voice_description: 音色描述，如"温柔的女声"、"成熟的男声"
    
    Returns:
        会话信息和下一步指引
    """
    from voice.studio.service import create_session
    
    # 验证角色权限
    if runtime.context.persona_id != persona_id:
        return {
            "status": "denied",
            "reason": "只能为当前角色创建语音克隆会话"
        }
    
    try:
        session = create_session(persona_id)
        logger.info(f"Created voice clone session {session.id} for persona {persona_id}")
        
        return {
            "status": "created",
            "session_id": session.id,
            "next_step": "upload_material",
            "guidance": (
                "请上传 10-30 秒的干净语音素材（支持视频/音频）。"
                "要求：单人说话、无背景音乐、无明显噪音。"
            )
        }
    except Exception as e:
        logger.error(f"Failed to create voice clone session: {e}")
        return {
            "status": "failed",
            "reason": str(e)
        }


@tool
def analyze_voice_material(
    session_id: str,
    file_path: str,
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    分析上传的语音素材质量。
    
    Args:
        session_id: 会话 ID
        file_path: 已上传的文件路径
    
    Returns:
        质量分析结果
    """
    from voice.studio.service import analyze_audio_quality
    
    try:
        result = analyze_audio_quality(session_id, file_path)
        
        # 质量门检查
        issues = []
        if result["duration"] < 10:
            issues.append(f"时长过短（{result['duration']}秒，建议 ≥10 秒）")
        if result["duration"] > 120:
            issues.append(f"时长过长（{result['duration']}秒，建议 ≤120 秒）")
        if result["noise_db"] > 15:
            issues.append(f"噪音过大（{result['noise_db']}dB，建议 ≤15dB）")
        if result["speaker_count"] != 1:
            issues.append(f"检测到 {result['speaker_count']} 个说话人（建议单人）")
        
        if issues:
            return {
                "status": "quality_issues",
                "issues": issues,
                "suggestion": "请重新上传质量更好的素材",
                "can_proceed": False
            }
        
        return {
            "status": "quality_ok",
            "duration": result["duration"],
            "language": result["language"],
            "noise_db": result["noise_db"],
            "speaker_count": result["speaker_count"],
            "next_step": "confirm_training",
            "can_proceed": True
        }
        
    except Exception as e:
        logger.error(f"Failed to analyze voice material: {e}")
        return {
            "status": "analysis_failed",
            "reason": str(e),
            "can_proceed": False
        }


@tool
def request_training_confirmation(
    session_id: str,
    runtime: ToolRuntime[PersonaAgentContext]
) -> Command:
    """
    请求用户确认开始训练（触发 HITL 中断）。
    
    Args:
        session_id: 会话 ID
    
    Returns:
        中断命令，等待用户确认
    """
    from voice.studio.service import get_session_info
    
    session = get_session_info(session_id)
    
    # 触发 LangGraph 中断
    return Command(
        interrupt=[{
            "type": "voice_training_confirmation",
            "session_id": session_id,
            "duration": session["material_duration"],
            "estimated_time": "3-5 分钟",
            "message": (
                f"将使用 {session['material_duration']} 秒素材训练音色，"
                "预计耗时 3-5 分钟。训练完成后可试听效果。是否开始训练？"
            )
        }]
    )


@tool
def start_voice_training(
    session_id: str,
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    启动语音训练任务（用户确认后调用）。
    
    Args:
        session_id: 会话 ID
    
    Returns:
        训练任务信息
    """
    from voice.studio.service import start_training
    
    try:
        task = start_training(session_id)
        logger.info(f"Started voice training task {task.id} for session {session_id}")
        
        return {
            "status": "training_started",
            "task_id": task.id,
            "estimated_seconds": task.estimated_seconds,
            "next_step": "poll_training_status",
            "guidance": "训练进行中，请等待..."
        }
        
    except Exception as e:
        logger.error(f"Failed to start voice training: {e}")
        return {
            "status": "training_failed",
            "reason": str(e)
        }


@tool
def check_training_progress(
    session_id: str,
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    查询训练进度。
    
    Args:
        session_id: 会话 ID
    
    Returns:
        训练状态和进度
    """
    from voice.studio.service import get_training_status
    
    try:
        status = get_training_status(session_id)
        
        return {
            "status": status["state"],  # "training" / "completed" / "failed"
            "progress": status["progress"],  # 0-100
            "eta_seconds": status.get("eta_seconds"),
            "error": status.get("error")
        }
        
    except Exception as e:
        return {
            "status": "query_failed",
            "reason": str(e)
        }


@tool
def bind_trained_voice(
    session_id: str,
    voice_name: str,
    runtime: ToolRuntime[PersonaAgentContext]
) -> dict[str, Any]:
    """
    将训练完成的音色绑定到角色。
    
    Args:
        session_id: 会话 ID
        voice_name: 音色名称
    
    Returns:
        绑定结果
    """
    from voice.studio.service import save_and_bind_voice
    
    persona_id = runtime.context.persona_id
    
    try:
        voice = save_and_bind_voice(
            session_id=session_id,
            voice_name=voice_name,
            persona_id=persona_id
        )
        
        logger.info(f"Bound voice {voice.id} to persona {persona_id}")
        
        return {
            "status": "completed",
            "voice_id": voice.id,
            "voice_name": voice_name,
            "message": (
                f"音色「{voice_name}」已绑定到角色。"
                "对话中将自动使用该音色进行语音合成。"
            )
        }
        
    except Exception as e:
        logger.error(f"Failed to bind voice: {e}")
        return {
            "status": "binding_failed",
            "reason": str(e)
        }
