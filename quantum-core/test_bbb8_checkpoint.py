from __future__ import annotations

from fastapi.testclient import TestClient

from bbb8_app import app
from bbb8_models import Observation, RunRequest
from bbb8_routes import set_service_for_tests
from bbb8_service import FabricService

MASTER = b"bbb8-checkpoint-test-master-secret-v21-0001"


def _service(tmp_path):
    return FabricService(
        str(tmp_path / "checkpoint.sqlite3"),
        allow_classical_fallback=True,
        keyvault_master=MASTER,
    )


def test_external_checkpoint_matches_current_head(tmp_path):
    service = _service(tmp_path)
    response = service.run(
        RunRequest(
            request_id="checkpoint-1",
            observation=Observation(telemetry=[0.01, 0.02]),
        )
    )
    assert response.outcome == "approve"

    checkpoint = service.external_checkpoint()
    assert checkpoint["network"] == "BBB8-LOCAL"
    assert checkpoint["height"] == 1
    assert service.verify_external_checkpoint(checkpoint) is True


def test_external_checkpoint_detects_local_rollback(tmp_path):
    service = _service(tmp_path)
    service.run(
        RunRequest(
            request_id="checkpoint-2",
            observation=Observation(telemetry=[0.01, 0.02]),
        )
    )
    checkpoint = service.external_checkpoint()

    import sqlite3

    with sqlite3.connect(service.db_path) as conn:
        conn.execute("DELETE FROM chain WHERE height >= 1")
        conn.commit()

    assert service.head()[0] == 0
    assert service.verify_external_checkpoint(checkpoint) is False


def test_external_checkpoint_rejects_hash_mismatch(tmp_path):
    service = _service(tmp_path)
    checkpoint = service.external_checkpoint()
    checkpoint["head_hash"] = "0" * 128
    assert service.verify_external_checkpoint(checkpoint) is False


def test_external_checkpoint_rejects_wrong_network(tmp_path):
    service = _service(tmp_path)
    checkpoint = service.external_checkpoint()
    checkpoint["network"] = "OTHER"
    assert service.verify_external_checkpoint(checkpoint) is False


def test_checkpoint_api(tmp_path):
    service = _service(tmp_path)
    set_service_for_tests(service)
    try:
        client = TestClient(app)
        current = client.post("/v1/fabric/checkpoint", json={})
        assert current.status_code == 200
        checkpoint = current.json()

        verified = client.post("/v1/fabric/checkpoint/verify", json=checkpoint)
        assert verified.status_code == 200
        assert verified.json()["valid"] is True
        assert "out-of-band" in verified.json()["note"]
    finally:
        set_service_for_tests(None)
