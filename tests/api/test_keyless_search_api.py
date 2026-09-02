def test_keyless_status_endpoint_is_removed(client):
    assert client.get("/api/system/web-search-keyless").status_code == 404


def test_keyless_mutation_endpoint_is_removed(client):
    assert client.post("/api/system/web-search-keyless", json={"enabled": True}).status_code == 404
