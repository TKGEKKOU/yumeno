import hashlib
import shutil
from pathlib import Path

from sqlalchemy import select

from app.attachments import attachment_root
from app.models import ConversationAttachment, ConversationMessage, ConversationSummary, Persona
from persona.service import LOCAL_WORKSPACE_ID


def clear_conversation_data(session, checkpointer, persona_id: str, conversation_id: str,
                            audio_root: Path) -> None:
    messages = list(session.scalars(
        select(ConversationMessage).where(
            ConversationMessage.workspace_id == LOCAL_WORKSPACE_ID,
            ConversationMessage.persona_id == persona_id,
            ConversationMessage.conversation_id == conversation_id,
        )
    ))
    checkpointer.delete_thread(f"{persona_id}:{conversation_id}")
    summaries = list(session.scalars(
        select(ConversationSummary).where(
            ConversationSummary.workspace_id == LOCAL_WORKSPACE_ID,
            ConversationSummary.persona_id == persona_id,
            ConversationSummary.conversation_id == conversation_id,
        )
    ))
    for summary in summaries:
        session.delete(summary)
    attachments = list(session.scalars(
        select(ConversationAttachment).where(
            ConversationAttachment.workspace_id == LOCAL_WORKSPACE_ID,
            ConversationAttachment.conversation_id == conversation_id,
        )
    ))
    for attachment in attachments:
        session.delete(attachment)
    project_root = audio_root.resolve().parents[1]
    attachment_directory = attachment_root(project_root, conversation_id)
    if attachment_directory.exists():
        shutil.rmtree(attachment_directory)
    directory = audio_root / hashlib.sha256(conversation_id.encode("utf-8")).hexdigest()[:32]
    if directory.exists():
        shutil.rmtree(directory)
    for message in messages:
        session.delete(message)
    session.commit()


def clear_im_window_data(session, checkpointer, platform: str, chat_type: str,
                         chat_id: str, audio_root: Path) -> int:
    """Clear all persona conversation threads belonging to one IM window."""

    conversation_id = f"im:{platform}:{chat_type}:{chat_id}"
    persona_ids = list(session.scalars(
        select(Persona.id).where(Persona.workspace_id == LOCAL_WORKSPACE_ID)
    ))
    for persona_id in persona_ids:
        clear_conversation_data(session, checkpointer, persona_id, conversation_id, audio_root)
    return len(persona_ids)
