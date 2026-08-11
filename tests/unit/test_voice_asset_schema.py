from sqlalchemy import create_engine, inspect, text

from app.database import upgrade_voice_asset_schema
from app.models import VoiceAsset


def test_voice_asset_exposes_reference_language(db_session):
    asset = VoiceAsset(name="JP", workspace_id="local", reference_language="ja")
    db_session.add(asset)
    db_session.commit()

    assert db_session.get(VoiceAsset, asset.id).reference_language == "ja"


def test_upgrade_adds_reference_language_to_legacy_sqlite(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE voice_assets (id VARCHAR(36) PRIMARY KEY)"))

    upgrade_voice_asset_schema(engine)

    columns = {column["name"] for column in inspect(engine).get_columns("voice_assets")}
    assert "reference_language" in columns
