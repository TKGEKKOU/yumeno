from sqlalchemy import create_engine, inspect

from agents.runtime.models import (
    AgentRun,
    RunStatus,
    RuntimeStep,
    RuntimeTask,
    StepStatus,
    TaskStatus,
)
from app.database import Base, upgrade_runtime_schema
from app.models import AgentRunEventRecord, AgentRunRecord
from app.run_store import RunStore


def _store(db_session):
    return RunStore(lambda: db_session)


def test_runtime_task_and_step_models_round_trip_sanitized_summaries():
    task = RuntimeTask(
        task_id="task-model-1",
        run_id="run-model-1",
        name="knowledge_search",
        status=TaskStatus.RUNNING,
        input_summary={"source": "chat", "count": 2, "prompt": "must-not-persist"},
        output_summary={"result_count": 3, "answer": "must-not-persist"},
        metadata={"status": "running", "api_key": "must-not-persist"},
    )
    step = RuntimeStep(
        step_id="step-model-1",
        task_id=task.task_id,
        sequence=1,
        name="retrieve",
        worker="rag",
        status=StepStatus.COMPLETED,
        input_summary={"worker": "rag", "query": "must-not-persist"},
        output_summary={"result_count": 3, "documents": ["must-not-persist"]},
        resume_state={"status": "completed", "cursor": "must-not-persist"},
    )

    restored_task = RuntimeTask.model_validate(task.model_dump())
    restored_step = RuntimeStep.model_validate(step.model_dump())

    assert restored_task.status is TaskStatus.RUNNING
    assert restored_task.input_summary == {"source": "chat", "count": 2}
    assert restored_task.output_summary == {"result_count": 3}
    assert restored_task.metadata == {"status": "running"}
    assert restored_step.status is StepStatus.COMPLETED
    assert restored_step.input_summary == {"worker": "rag"}
    assert restored_step.output_summary == {"result_count": 3}
    assert restored_step.resume_state == {"status": "completed"}
    assert "must-not-persist" not in restored_task.model_dump_json()
    assert "must-not-persist" not in restored_step.model_dump_json()


def test_run_store_round_trips_task_and_steps_sorted_by_task_sequence(db_session):
    store = _store(db_session)
    store.create(AgentRun(run_id="run-task-1", status=RunStatus.QUEUED))
    task = store.create_task(
        RuntimeTask(
            task_id="task-store-1",
            run_id="run-task-1",
            name="document_index",
            input_summary={"source": "upload", "prompt": "must-not-persist"},
        )
    )
    store.create_step(
        RuntimeStep(
            step_id="step-store-2",
            task_id=task.task_id,
            sequence=2,
            name="embed",
            worker="embedding",
            output_summary={"count": 4},
        )
    )
    store.create_step(
        RuntimeStep(
            step_id="step-store-1",
            task_id=task.task_id,
            sequence=1,
            name="chunk",
            worker="document",
            input_summary={"source": "upload"},
        )
    )

    loaded_task = store.get_task(task.task_id)
    loaded_steps = store.list_steps(task.task_id)
    loaded_step = store.get_step("step-store-1")

    assert loaded_task is not None
    assert loaded_task.task_id == "task-store-1"
    assert loaded_task.run_id == "run-task-1"
    assert loaded_task.status is TaskStatus.QUEUED
    assert loaded_task.input_summary == {"source": "upload"}
    assert [step.step_id for step in loaded_steps] == ["step-store-1", "step-store-2"]
    assert [step.sequence for step in loaded_steps] == [1, 2]
    assert loaded_step is not None
    assert loaded_step.worker == "document"


def test_run_store_keeps_legacy_runs_readable_without_tasks(db_session):
    store = _store(db_session)
    store.create(AgentRun(run_id="run-legacy-1"))

    assert store.get("run-legacy-1") is not None
    assert store.list_tasks("run-legacy-1") == []


def test_runtime_schema_upgrade_creates_task_and_step_tables_for_existing_runtime():
    engine = create_engine("sqlite://")
    try:
        Base.metadata.create_all(
            engine,
            tables=[AgentRunRecord.__table__, AgentRunEventRecord.__table__],
        )

        upgrade_runtime_schema(engine)

        tables = set(inspect(engine).get_table_names())
        assert {"agent_runs", "agent_run_events", "runtime_tasks", "runtime_steps"} <= tables
    finally:
        engine.dispose()
