from __future__ import annotations

from fastapi.testclient import TestClient

from bbb8_routes import set_service_for_tests
from bbb8_service import FabricService
from main import app

TEST_MASTER = b"bbb8-test-keyvault-master-secret-v21-0001"


def test_bbb8_run_via_main(tmp_path):
    set_service_for_tests(
        FabricService(
            str(tmp_path / "main.sqlite3"),
            allow_classical_fallback=True,
            keyvault_master=TEST_MASTER,
        )
    )
    try:
        client = TestClient(app)
        response = client.post(
            "/v1/fabric/run",
            json={
                "request_id": "main-1",
                "observation": {
                    "telemetry": [0.05],
                    "declared_risk": 0.05,
                },
            },
        )
        assert response.status_code == 200
        assert response.json()["outcome"] == "approve"
    finally:
        set_service_for_tests(None)
