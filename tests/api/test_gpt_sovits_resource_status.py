class FakeGPTInstall:
    def status(self):
        return {
            "installed": True,
            "installation_ready": True,
            "ready": False,
            "service_running": False,
            "installing": False,
            "missing": [],
            "next_action": "start_service",
            "install_dir": "D:/managed/gpt_sovits",
        }

    def start_install(self, url):
        del url

    def cancel_install(self):
        return False

    def remove_install(self):
        return self.status()


class FakeGPTAdapter:
    def status(self):
        return {
            "configured": True,
            "installed": True,
            "installation_ready": True,
            "ready": False,
            "service_running": False,
            "missing": [],
            "next_action": "start_service",
            "install_dir": "D:/managed/gpt_sovits",
            "api_port": 17005,
        }

    def stop_service(self):
        return None


def test_gpt_sovits_resource_status_is_standardized(client):
    client.app.state.gpt_sovits_install = FakeGPTInstall()
    client.app.state.gpt_sovits = FakeGPTAdapter()
    headers = {"X-YUMENO-Request": "web"}

    status_response = client.get("/api/resources/gpt_sovits/status", headers=headers)
    assert status_response.status_code == 200
    status = status_response.json()["status"]
    assert status_response.json()["provider_id"] == "gpt_sovits"
    assert status["installed"] is True
    assert status["installation_ready"] is True
    assert status["ready"] is False
    assert status["service_running"] is False
    assert status["missing"] == []
    assert status["next_action"] == "start_service"

    catalog_response = client.get("/api/resources", headers=headers)
    assert catalog_response.status_code == 200
    item = next(item for item in catalog_response.json()["items"] if item["provider_id"] == "gpt_sovits")
    assert item["status"] == status
