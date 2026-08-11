import json
from pathlib import Path

from extensions.catalog import validate_catalog


def test_bundled_catalog_example_is_valid():
    payload = json.loads(Path("data/extension-catalog.example.json").read_text(encoding="utf-8"))
    assert validate_catalog(payload).items
