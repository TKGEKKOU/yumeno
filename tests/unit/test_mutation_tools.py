import pytest
from sqlalchemy import func, select

from agents.context import PersonaAgentContext
from agents.registry import AUTOMATIC_TOOL_NAMES, MUTATION_TOOL_NAMES, tool_specs
from agents.tools.memory import save_memory_for_context, update_memory_for_context
from agents.tools.management import (
    add_knowledge_for_context,
    delete_document_for_context,
    rename_persona_for_context,
)
from app.models import DocumentJob, PersonaMemory
from persona.service import create_persona


def context_for(persona, db_session):
    return PersonaAgentContext(
        persona_id=persona.id,
        workspace_id="local-default",
        knowledge_space_ids=(persona.knowledge_space_id,),
        conversation_id="thread-a",
        persona_name=persona.name,
        persona_type=persona.persona_type,
        persona_profile=persona.profile_json,
        session_factory=lambda: db_session,
    )


def test_memory_write_runs_without_confirmation(db_session):
    persona = create_persona(db_session, "Alpha")
    db_session.commit()

    result = save_memory_for_context(context_for(persona, db_session), "用户喜欢红茶")

    assert result["status"] == "saved"
    assert db_session.scalar(select(func.count()).select_from(PersonaMemory)) == 1


def test_confirmed_memory_is_scoped_and_cross_persona_update_is_rejected(db_session):
    first = create_persona(db_session, "First")
    second = create_persona(db_session, "Second")
    db_session.commit()
    created = save_memory_for_context(
        context_for(first, db_session),
        "用户喜欢红茶",
    )

    memory = db_session.get(PersonaMemory, created["memory_id"])
    assert memory.persona_id == first.id
    with pytest.raises(LookupError):
        update_memory_for_context(
            context_for(second, db_session),
            memory.id,
            "用户喜欢咖啡",
        )


def test_each_persona_rename_requests_confirmation(db_session):
    persona = create_persona(db_session, "Alpha")
    db_session.commit()
    confirmations = []
    context = context_for(persona, db_session)

    rename_persona_for_context(context, "Beta", confirmer=lambda action: confirmations.append(action) or True)
    rename_persona_for_context(context, "Gamma", confirmer=lambda action: confirmations.append(action) or True)

    assert len(confirmations) == 2
    assert db_session.get(type(persona), persona.id).name == "Gamma"


def test_add_persona_knowledge_is_confirmed_and_scoped(db_session, tmp_path):
    persona = create_persona(db_session, "Alpha")
    db_session.commit()
    confirmations = []
    indexed = []

    result = add_knowledge_for_context(
        context_for(persona, db_session),
        "# 共鸣回路\n\n光学取样。",
        title="共鸣回路",
        confirmer=lambda action: confirmations.append(action) or True,
        indexer=lambda job_id, session_factory: indexed.append(job_id),
        data_dir=tmp_path,
    )

    job = db_session.get(DocumentJob, result["job_id"])
    assert confirmations[0]["tool"] == "add_persona_knowledge"
    assert job.knowledge_space_id == persona.knowledge_space_id
    assert job.markdown_preview == "# 共鸣回路\n\n光学取样。"
    assert indexed == [job.id]


def test_registry_marks_every_mutation_as_confirmed():
    expected = {
        "add_persona_knowledge",
        "import_knowledge_from_url",
        "rename_persona",
        "update_persona_profile",
        "delete_persona_document",
        "save_workspace_memory",
        "delete_workspace_memory",
        "request_training_confirmation",
        "request_config_change",
    }
    assert set(MUTATION_TOOL_NAMES) == expected
    mutation_specs = [spec for spec in tool_specs() if spec.name in expected]
    assert mutation_specs and all(spec.requires_confirmation for spec in mutation_specs)
    assert {
        "save_persona_memory",
        "update_persona_memory",
        "delete_persona_memory",
    }.issubset(AUTOMATIC_TOOL_NAMES)


def test_delete_document_tool_cleans_structured_storage(db_session, monkeypatch):
    persona = create_persona(db_session, "Alpha")
    document = DocumentJob(
        workspace_id="local-default",
        knowledge_space_id=persona.knowledge_space_id,
        original_filename="sales.csv",
        markdown_filename="sales.md",
        source_path="sales.csv",
        status="indexed",
    )
    db_session.add(document)
    db_session.commit()
    deleted = []

    class Store:
        def delete_document(self, scope, document_id):
            return None

    monkeypatch.setattr(
        "agents.tools.management.delete_structured_document",
        lambda root, workspace_id, knowledge_space_id, document_id: deleted.append(
            (workspace_id, knowledge_space_id, document_id)
        ),
    )
    result = delete_document_for_context(
        context_for(persona, db_session),
        document.id,
        confirmer=lambda action: True,
        store=Store(),
    )

    assert result["status"] == "deleted"
    assert deleted == [
        ("local-default", persona.knowledge_space_id, document.document_id)
    ]



def test_add_persona_knowledge_uses_context_runtime_when_no_legacy_indexer(
    db_session, tmp_path, monkeypatch
):
    from agents.runtime.runner import AgentRuntime
    from app.run_store import RunStore
    from agents.tools.management import add_knowledge_for_context

    persona = create_persona(db_session, "Runtime knowledge")
    db_session.commit()
    monkeypatch.setattr("ingestion.document_jobs.ingest_markdown_file", lambda path, scope: 1)
    runtime = AgentRuntime(object(), RunStore(lambda: db_session))
    context = context_for(persona, db_session)
    context = context.__class__(**{**context.__dict__, "agent_runtime": runtime})

    result = add_knowledge_for_context(
        context,
        "# Runtime\n\n通过统一运行时索引。",
        data_dir=tmp_path,
        confirmer=lambda action: True,
    )

    assert result["status"] == "indexed"
    assert result["run_id"]
    runtime_run = runtime.run_store.get(result["run_id"])
    assert runtime_run is not None
    assert runtime_run.status.value == "completed"
    assert [event.name for event in runtime.run_store.list_events(result["run_id"])] == [
        "task_started",
        "index_started",
        "task_completed",
    ]
