from agents.graph.supervisor import _dispatch_request_error, _missing_dispatch_inputs


def _request(worker, task_type, refs=None, options=None):
    return {
        "worker": worker,
        "task_type": task_type,
        "conversation_context": {"conversation_id": "c1", "workspace_id": "ws-1", "persona_id": "p1"},
        "input_refs": refs or {},
        "options": options or {},
    }


def test_document_worker_does_not_block_list_or_manage_without_attachments():
    for task_type in ("manage_document", "legacy_request"):
        request = _request("document_worker", task_type)
        assert _dispatch_request_error(request, "document_worker") is None
        assert _missing_dispatch_inputs(request, "document_worker") == []


def test_document_worker_ingest_requires_attachment_or_url():
    missing = _missing_dispatch_inputs(_request("document_worker", "ingest_document"), "document_worker")
    assert missing
    assert missing[0]["input_id"] == "document_worker"

    by_file = _request("document_worker", "ingest_document", refs={"attachment_ids": ["att-1"]})
    assert _missing_dispatch_inputs(by_file, "document_worker") == []

    by_url = _request("document_worker", "ingest_document", options={"source_url": "https://example.com/doc.md"})
    assert _missing_dispatch_inputs(by_url, "document_worker") == []


def test_voice_status_task_type_is_accepted():
    request = _request("voice_worker", "voice_status")
    assert _dispatch_request_error(request, "voice_worker") is None
    assert _missing_dispatch_inputs(request, "voice_worker") == []


def test_voice_clone_requires_attachment_but_status_does_not():
    missing = _missing_dispatch_inputs(_request("voice_worker", "voice_clone"), "voice_worker")
    assert missing
    assert missing[0]["input_id"] == "voice_material"

    with_file = _request("voice_worker", "voice_clone", refs={"attachment_ids": ["att-1"]})
    assert _missing_dispatch_inputs(with_file, "voice_worker") == []

    status = _request("voice_worker", "voice_status")
    assert _missing_dispatch_inputs(status, "voice_worker") == []
    asset = _request("voice_worker", "voice_asset")
    assert _missing_dispatch_inputs(asset, "voice_worker") == []

def test_voice_synthesize_and_training_do_not_require_attachments():
    synthesize = _request("voice_worker", "voice_synthesize")
    assert _dispatch_request_error(synthesize, "voice_worker") is None
    assert _missing_dispatch_inputs(synthesize, "voice_worker") == []

    training = _request("voice_worker", "voice_training")
    assert _dispatch_request_error(training, "voice_worker") is None
    assert _missing_dispatch_inputs(training, "voice_worker") == []


def test_voice_transcribe_requires_attachment():
    missing = _missing_dispatch_inputs(_request("voice_worker", "voice_transcribe"), "voice_worker")
    assert missing
    assert missing[0]["input_id"] == "audio_attachment"

    with_file = _request("voice_worker", "voice_transcribe", refs={"attachment_ids": ["att-1"]})
    assert _missing_dispatch_inputs(with_file, "voice_worker") == []
    assert _dispatch_request_error(_request("voice_worker", "voice_transcribe"), "voice_worker") is None


def test_voice_reference_requires_attachment():
    missing = _missing_dispatch_inputs(_request("voice_worker", "voice_reference"), "voice_worker")
    assert missing
    assert missing[0]["input_id"] == "audio_attachment"

    with_file = _request("voice_worker", "voice_reference", refs={"attachment_ids": ["att-1"]})
    assert _missing_dispatch_inputs(with_file, "voice_worker") == []
    assert _dispatch_request_error(_request("voice_worker", "voice_reference"), "voice_worker") is None
