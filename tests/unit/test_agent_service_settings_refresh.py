from types import SimpleNamespace


def test_persona_agent_graph_rebuilds_after_runtime_llm_settings_change(monkeypatch):
    import agents.service as service_module

    settings = SimpleNamespace(openai_api_key="key-a", openai_base_url="https://a.example/v1", openai_model="model-a")
    builds = []
    models = []

    monkeypatch.setattr(service_module.Settings, "load", lambda: settings)
    monkeypatch.setattr(service_module, "get_llm", lambda active: models.append(active.openai_model) or f"llm:{active.openai_model}")
    monkeypatch.setattr(service_module.tool_registry, "tool_registry_revision", lambda: 1)
    monkeypatch.setattr(
        service_module,
        "build_persona_workflow",
        lambda model, checkpointer: builds.append((model, checkpointer)) or object(),
    )

    agent = service_module.PersonaAgentService(checkpointer="checkpoint")

    first = agent._graph()
    same = agent._graph()
    settings.openai_api_key = "key-b"
    settings.openai_base_url = "https://b.example/v1"
    settings.openai_model = "model-b"
    refreshed = agent._graph()

    assert first is same
    assert refreshed is not first
    assert models == ["model-a", "model-a", "model-b"]
    assert [model for model, _ in builds] == ["llm:model-a", "llm:model-b"]


def test_persona_agent_with_injected_model_ignores_global_settings(monkeypatch):
    import agents.service as service_module

    builds = []
    monkeypatch.setattr(service_module.tool_registry, "tool_registry_revision", lambda: 1)
    monkeypatch.setattr(
        service_module,
        "build_persona_workflow",
        lambda model, checkpointer: builds.append(model) or object(),
    )
    monkeypatch.setattr(service_module, "get_llm", lambda *_: (_ for _ in ()).throw(AssertionError("must not load global LLM")))

    agent = service_module.PersonaAgentService(checkpointer=None, model="injected")

    first = agent._graph()
    second = agent._graph()

    assert first is second
    assert builds == ["injected"]
