from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from bbb8_app import app
from bbb8_routes import set_service_for_tests
from bbb8_service import FabricService

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated_service(tmp_path):
    service = FabricService(
        str(tmp_path / "gateway.sqlite3"),
        allow_classical_fallback=True,
    )
    set_service_for_tests(service)
    yield service
    set_service_for_tests(None)


def test_health_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_lab_html():
    response = client.get("/lab")
    assert response.status_code == 200
    assert "QuantumSynapse BBB8 Research Lab" in response.text


def test_fabric_run_approve():
    response = client.post(
        "/v1/fabric/run",
        json={
            "request_id": "gw-1",
            "observation": {
                "telemetry": [0.05, 0.1],
                "declared_risk": 0.05,
            },
        },
    )
    assert response.status_code == 200
    assert response.json()["outcome"] == "approve"


def test_fabric_run_eve_rejects():
    response = client.post(
        "/v1/fabric/run",
        json={
            "request_id": "gw-eve",
            "quantum": {
                "pairs": 4096,
                "seed": 7,
                "sample_fraction": 0.25,
                "intercept_resend": True,
            },
            "observation": {"telemetry": [0.01]},
        },
    )
    assert response.status_code == 200
    assert response.json()["outcome"] == "reject"
    assert response.json()["qkd"]["passed"] is False


def test_fabric_run_schema_reject():
    response = client.post(
        "/v1/fabric/run",
        json={
            "request_id": "gw-2",
            "observation": {"telemetry": [0.05]},
            "bogus": 1,
        },
    )
    assert response.status_code == 422


def test_same_request_id_different_input_returns_409():
    first = {
        "request_id": "gw-conflict",
        "observation": {"telemetry": [0.05], "declared_risk": 0.0},
    }
    second = {
        "request_id": "gw-conflict",
        "observation": {"telemetry": [0.05], "declared_risk": 0.9},
    }
    assert client.post("/v1/fabric/run", json=first).status_code == 200
    response = client.post("/v1/fabric/run", json=second)
    assert response.status_code == 409


def test_fabric_status_and_ledger():
    assert client.post("/v1/fabric/status", json={}).status_code == 200
    response = client.post(
        "/v1/fabric/ledger",
        json={"after_height": -1, "limit": 5},
    )
    assert response.status_code == 200
    assert "blocks" in response.json()


def test_invalid_ledger_limit_rejected_by_schema():
    response = client.post(
        "/v1/fabric/ledger",
        json={"after_height": -1, "limit": 101},
    )
    assert response.status_code == 422


def test_verify_committed_block():
    run = client.post(
        "/v1/fabric/run",
        json={
            "request_id": "gw-verify",
            "observation": {"telemetry": [0.02]},
        },
    )
    block = run.json()["block"]
    response = client.post("/v1/fabric/verify", json={"block": block})
    assert response.status_code == 200
    assert response.json()["certificate_valid"] is True
    assert response.json()["included_in_local_ledger"] is True
