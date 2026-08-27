from sqlalchemy import create_engine, inspect, text

from app.database import upgrade_document_job_schema


def test_upgrade_adds_semantic_index_columns_to_legacy_sqlite(tmp_path):
    engine = create_engine(f"sqlite:///{(tmp_path / 'legacy.db').as_posix()}")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE document_jobs (id VARCHAR(36) PRIMARY KEY)"))

    upgrade_document_job_schema(engine)
    upgrade_document_job_schema(engine)

    columns = {column["name"] for column in inspect(engine).get_columns("document_jobs")}
    assert {"document_type", "chunking_preset", "chunker_version", "index_version"} <= columns
