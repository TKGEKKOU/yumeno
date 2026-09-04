from types import SimpleNamespace

from agents.tools.config import (
    get_resource_install_status,
    manage_resource_install,
)


class FakeEmbedding:
    def __init__(self):
        self.installed = []
        self.removed = 0

    def status(self):
        return {
            "model_id": "Qwen/Qwen3-Embedding-0.6B",
            "source": "modelscope",
            "device": "cpu",
            "installed": False,
            "ready": False,
            "installing": False,
            "phase": "idle",
        }

    def start_install(self, model_id: str, source: str, device: str) -> dict:
        self.installed.append((model_id, source, device))
        return {"phase": "preparing", "installing": True, "model_id": model_id, "source": source, "device": device}

    def cancel_install(self) -> dict:
        return {"phase": "cancelled"}

    def remove_model(self) -> dict:
        self.removed += 1
        return {"phase": "idle", "installed": False}


class FakeRVC:
    def status(self):
        return {"ready": True, "installed": True, "installing": False, "phase": "ready"}

    def start_install(self):
        return {"phase": "preparing", "installing": True}

    def cancel_install(self):
        return {"phase": "cancelled"}

    def remove_managed(self):
        return {"phase": "idle", "installed": False}


def _runtime(**managers):
    app_state = SimpleNamespace(**managers)
    return SimpleNamespace(context=SimpleNamespace(agent_runtime=SimpleNamespace(app_state=app_state)))


def test_config_worker_lists_all_managed_resources_and_aliases():
    runtime = _runtime(embedding_resources=FakeEmbedding(), rvc_resources=FakeRVC())

    listed = get_resource_install_status.func("all", runtime)
    assert listed["status"] == "ok"
    assert listed["resource"] == "all"
    assert {item["resource"] for item in listed["items"]} == {"rvc", "embedding"}

    aliased = get_resource_install_status.func("local_embedding", runtime)
    assert aliased["status"] == "ok"
    assert aliased["resource"] == "embedding"
    assert aliased["capabilities"]["clean"] is True


def test_config_worker_installs_embedding_from_manager_status_not_download_url():
    embedding = FakeEmbedding()
    runtime = _runtime(embedding_resources=embedding)

    result = manage_resource_install.func("embedding", "install", runtime)

    assert result["status"] == "accepted"
    assert result["resource"] == "embedding"
    assert embedding.installed == [("Qwen/Qwen3-Embedding-0.6B", "modelscope", "cpu")]


def test_config_worker_can_clean_resources_that_only_expose_remove_model():
    embedding = FakeEmbedding()
    runtime = _runtime(embedding_resources=embedding)

    result = manage_resource_install.func("local_embedding", "clean", runtime)

    assert result["status"] == "accepted"
    assert result["resource"] == "embedding"
    assert embedding.removed == 1


def test_config_worker_rejects_unknown_resource_without_touching_user_files():
    runtime = _runtime(rvc_resources=FakeRVC())

    result = manage_resource_install.func("user_pth", "clean", runtime)

    assert result["status"] == "failed"
    assert result["resource"] == "user_pth"
    assert "不支持" in result["error"]
