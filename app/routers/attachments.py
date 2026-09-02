from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, File, Header, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.attachments import create_attachment, delete_attachment, public_attachment, resolve_attachment, safe_name
from app.database import get_session
from app.models import ConversationAttachment
from persona.service import LOCAL_WORKSPACE_ID

router = APIRouter(tags=["conversation-attachments"])


def guard(header: str) -> None:
    if header != "web": raise HTTPException(status_code=403, detail="Missing same-origin request header")

class RenamePayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)


def get_item(session, request: Request, conversation_id: str, file_id: str):
    try: return resolve_attachment(session, request.app.state.settings.project_root, conversation_id, file_id, workspace_id=LOCAL_WORKSPACE_ID)
    except FileNotFoundError as exc: raise HTTPException(status_code=404, detail="Attachment not found") from exc

@router.post("/api/conversations/{conversation_id}/attachments", status_code=status.HTTP_201_CREATED)
async def upload_attachments(conversation_id: str, request: Request, files: list[UploadFile] = File(...), x_yumeno_request: str = Header(default=""), session: Session = Depends(get_session)):
    guard(x_yumeno_request)
    result=[]
    created_items = []
    try:
        for upload in files:
            data=await upload.read()
            item=create_attachment(session, request.app.state.settings.project_root, conversation_id, upload.filename or "attachment", upload.content_type or "", data, workspace_id=LOCAL_WORKSPACE_ID)
            created_items.append(item)
            result.append(public_attachment(item))
        session.commit()
    except ValueError as exc:
        session.rollback()
        for item in created_items:
            try:
                Path(item.storage_path).unlink(missing_ok=True)
            except OSError:
                pass
        raise HTTPException(status_code=413 if "512" in str(exc) else 415, detail=str(exc)) from exc
    except Exception:
        session.rollback()
        for item in created_items:
            try:
                Path(item.storage_path).unlink(missing_ok=True)
            except OSError:
                pass
        raise
    return {"attachments": result}

@router.get("/api/conversations/{conversation_id}/attachments")
def list_attachments(conversation_id: str, request: Request, session: Session = Depends(get_session)):
    rows=session.scalars(select(ConversationAttachment).where(ConversationAttachment.workspace_id==LOCAL_WORKSPACE_ID, ConversationAttachment.conversation_id==conversation_id, ConversationAttachment.status=="ready").order_by(ConversationAttachment.created_at.desc())).all()
    return {"attachments":[public_attachment(item) for item in rows]}

@router.get("/api/conversations/{conversation_id}/attachments/{file_id}")
def download_attachment(conversation_id: str, file_id: str, request: Request, session: Session = Depends(get_session)):
    from fastapi.responses import FileResponse
    item=get_item(session,request,conversation_id,file_id)
    return FileResponse(item.storage_path, media_type=item.mime_type, filename=item.name, content_disposition_type="inline")

@router.patch("/api/conversations/{conversation_id}/attachments/{file_id}")
def rename_attachment(conversation_id: str, file_id: str, payload: RenamePayload, request: Request, x_yumeno_request: str = Header(default=""), session: Session = Depends(get_session)):
    guard(x_yumeno_request); item=get_item(session,request,conversation_id,file_id)
    item.name=safe_name(payload.name); session.commit(); return public_attachment(item)

@router.delete("/api/conversations/{conversation_id}/attachments/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_attachment(conversation_id: str, file_id: str, request: Request, x_yumeno_request: str = Header(default=""), session: Session = Depends(get_session)):
    guard(x_yumeno_request); item=get_item(session,request,conversation_id,file_id); delete_attachment(session,request.app.state.settings.project_root,item); session.commit(); return None

@router.post("/api/conversations/{conversation_id}/attachments/{file_id}/send-to-rvc")
def send_to_rvc(conversation_id: str, file_id: str, request: Request, x_yumeno_request: str = Header(default=""), session: Session = Depends(get_session)):
    guard(x_yumeno_request); item=get_item(session,request,conversation_id,file_id)
    if item.kind not in {"audio","video"}: raise HTTPException(status_code=415, detail="只有音频或视频可以发送到 RVC")
    return {"status":"ready","target":"rvc","file_id":item.id,"message":"附件已准备好，可在对话中要求使用 RVC 处理。"}

@router.post("/api/conversations/{conversation_id}/attachments/{file_id}/send-to-rag")
def send_to_rag(conversation_id: str, file_id: str, request: Request, x_yumeno_request: str = Header(default=""), session: Session = Depends(get_session)):
    guard(x_yumeno_request); item=get_item(session,request,conversation_id,file_id)
    if item.kind != "document": raise HTTPException(status_code=415, detail="只有文档可以发送到知识库")
    return {"status":"ready","target":"rag","file_id":item.id,"message":"文档已准备好，请确认后由文档 Worker 导入知识库。"}
