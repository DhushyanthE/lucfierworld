from __future__ import annotations

import json
import math
import os
import sqlite3
from copy import deepcopy

import numpy as np
import pytest
from pydantic import ValidationError

from bbb8_consensus import (
    NETWORK_ID,
    POLICY_VERSION,
    QUORUM,
    make_certificate,
    make_registry,
    verify_block,
)
from bbb8_crypto import (
    DOMAINS,
    PQC_OK,
    canonical,
    crypto_mode,
    digest,
    new_identity,
    sign,
    transport_roundtrip,
    verify,
)
from bbb8_decision import (
    _parameter_shift_gradient,
    _qml_probability,
    analyze,
    trained_model,
)
from bbb8_models import Observation, QuantumConfig, RunRequest
from bbb8_quantum import QBER_UPPER_LIMIT, joint_probabilities, simulate_channel
from bbb8_service import FabricService, RequestConflictError


TEST_MASTER = b"bbb8-test-keyvault-master-secret-v21-0001"


def test_run_request_minimal():
    request = RunRequest(request_id="abc", observation=Observation(telemetry=[0.1]))
    assert request.quantum.pairs == 4096
    assert request.quantum.sample_fraction == 0.25


def test_run_request_rejects_extra_field():
    with pytest.raises(ValidationError):
        RunRequest(request_id="abc", observation={"telemetry": [0.1]}, bogus=1)


@pytest.mark.parametrize("bad", ["bad id!", "", "x/y", "x" * 129])
def test_request_id_validation(bad):
    with pytest.raises(ValidationError):
        RunRequest(request_id=bad, observation={"telemetry": [0.1]})


@pytest.mark.parametrize("pairs", [127, 200_001])
def test_pairs_bounds(pairs):
    with pytest.raises(ValidationError):
        RunRequest(
            request_id="a",
            quantum={"pairs": pairs},
            observation={"telemetry": [0.1]},
        )


@pytest.mark.parametrize("fraction", [0.0, -0.1, 0.500001])
def test_sample_fraction_bounds(fraction):
    with pytest.raises(ValidationError):
        QuantumConfig(sample_fraction=fraction)


@pytest.mark.parametrize("bad", [-0.01, 1.01, float("inf"), float("nan")])
def test_telemetry_is_normalized_and_finite(bad):
    with pytest.raises(ValidationError):
        Observation(telemetry=[bad])


def test_telemetry_not_empty():
    with pytest.raises(ValidationError):
        Observation(telemetry=[])


@pytest.mark.parametrize("bad", [-0.1, 1.1])
def test_declared_risk_bounds(bad):
    with pytest.raises(ValidationError):
        Observation(telemetry=[0.1], declared_risk=bad)


@pytest.mark.parametrize(
    "grid",
    [
        [],
        [[0.1], [0.1, 0.2]],
        [[0.1] * 33],
        [[-0.1]],
        [[1.1]],
    ],
)
def test_image_grid_validation(grid):
    with pytest.raises(ValidationError):
        Observation(telemetry=[0.1], image_grid=grid)


def test_offline_cells_unique():
    with pytest.raises(ValidationError):
        RunRequest(
            request_id="a",
            observation={"telemetry": [0.1]},
            offline_cells=[1, 1],
        )


@pytest.mark.parametrize("cells", [[9], [-1], [0, 8, 9]])
def test_offline_cells_range(cells):
    with pytest.raises(ValidationError):
        RunRequest(
            request_id="a",
            observation={"telemetry": [0.1]},
            offline_cells=cells,
        )


@pytest.mark.parametrize("basis", ["X", "Z"])
def test_matching_basis_perfect_correlation(basis):
    distribution = joint_probabilities(basis, basis, None)
    assert distribution[(0, 0)] == 0.5
    assert distribution[(1, 1)] == 0.5
    assert distribution[(0, 1)] == 0.0
    assert distribution[(1, 0)] == 0.0


@pytest.mark.parametrize("alice,bob", [("X", "Z"), ("Z", "X")])
def test_mismatched_basis_uniform(alice, bob):
    distribution = joint_probabilities(alice, bob, None)
    assert all(abs(value - 0.25) < 1e-12 for value in distribution.values())


@pytest.mark.parametrize("basis,eve", [("X", "Z"), ("Z", "X")])
def test_wrong_eve_basis_causes_fifty_percent_error(basis, eve):
    distribution = joint_probabilities(basis, basis, eve)
    error = distribution[(0, 1)] + distribution[(1, 0)]
    assert error == pytest.approx(0.5)


@pytest.mark.parametrize("basis", ["X", "Z"])
def test_matching_eve_basis_causes_no_error(basis):
    distribution = joint_probabilities(basis, basis, basis)
    error = distribution[(0, 1)] + distribution[(1, 0)]
    assert error == 0.0


@pytest.mark.parametrize("seed", [1, 7, 19])
def test_clean_channel_passes(seed):
    report = simulate_channel(4096, seed, 0.25, False)
    assert report.passed, report.reason
    assert report.qber == 0.0
    assert report.qber_upper < QBER_UPPER_LIMIT


@pytest.mark.parametrize("seed", [1, 7, 19, 41, 97])
def test_intercept_resend_is_near_twenty_five_percent_qber(seed):
    report = simulate_channel(8192, seed, 0.25, True)
    assert not report.passed
    assert 0.18 <= report.qber <= 0.32
    assert report.reason == "qber_above_threshold"


def test_channel_insufficient_sifted():
    report = simulate_channel(128, 0, 0.5, False)
    assert not report.passed
    assert report.reason in {"insufficient_sifted", "insufficient_samples"}


def test_qber_upper_is_conservative():
    report = simulate_channel(4096, 7, 0.25, False)
    assert report.qber_upper >= report.qber
    assert 0.0 <= report.qber_upper <= 1.0


def test_qber_report_is_explicitly_iid_only():
    report = simulate_channel(4096, 7, 0.25, False)
    assert report.iid_only is True
    assert report.finite_key_secure is False
    assert "not a composable finite-key" in report.note


def test_joint_probabilities_reject_bad_basis():
    with pytest.raises(ValueError):
        joint_probabilities("Y", "Z", None)


@pytest.mark.parametrize("x", [-1.0, -0.5, 0.0, 0.5, 1.0])
def test_qml_probability_bounds(x):
    probability = _qml_probability(x, 0.7, 0.1)
    assert 0.0 <= probability <= 1.0


@pytest.mark.parametrize(
    "x,w,b",
    [(-0.8, 0.7, -0.2), (0.25, 1.2, 0.4), (0.9, -0.5, 0.2)],
)
def test_parameter_shift_matches_finite_difference(x, w, b):
    d_w, d_b = _parameter_shift_gradient(x, w, b)
    eps = 1e-6
    fd_w = (
        _qml_probability(x, w + eps, b)
        - _qml_probability(x, w - eps, b)
    ) / (2 * eps)
    fd_b = (
        _qml_probability(x, w, b + eps)
        - _qml_probability(x, w, b - eps)
    ) / (2 * eps)
    assert d_w == pytest.approx(fd_w, abs=1e-6)
    assert d_b == pytest.approx(fd_b, abs=1e-6)


def test_model_reproduces_reported_heldout_accuracy():
    _, _, accuracy = trained_model()
    assert accuracy == pytest.approx(0.925)


@pytest.mark.parametrize(
    "telemetry,risk,expected",
    [
        ([0.01, 0.02], 0.0, "approve"),
        ([0.50], 0.50, "review"),
        ([0.99, 0.98], 0.95, "reject"),
    ],
)
def test_decision_policy(telemetry, risk, expected):
    assert analyze(telemetry, risk, None).outcome == expected


def test_decision_image_features_are_statistics():
    decision = analyze([0.1], 0.1, [[0.5, 0.6], [0.4, 0.5]])
    assert decision.features["img_mean"] == pytest.approx(0.5)
    assert decision.features["img_contrast"] == pytest.approx(0.2)


def test_canonical_is_deterministic():
    assert canonical({"b": 1, "a": 2}) == b'{"a":2,"b":1}'


def test_canonical_rejects_nan():
    with pytest.raises(ValueError):
        canonical({"x": float("nan")})


def test_digest_is_sha3_512_sized():
    value = digest(DOMAINS["proposal"], {"x": 1})
    assert len(value) == 64


def test_domain_separation():
    payload = {"x": 1}
    assert digest(DOMAINS["proposal"], payload) != digest(DOMAINS["vote"], payload)


def test_sign_verify_roundtrip():
    identity = new_identity()
    d, signature = sign(identity, "proposal", {"x": 1})
    assert verify(
        identity.public_key,
        identity.algorithm,
        "proposal",
        {"x": 1},
        signature,
        expected_digest=d,
    )


def test_signature_rejects_tampered_payload():
    identity = new_identity()
    d, signature = sign(identity, "proposal", {"x": 1})
    assert not verify(
        identity.public_key,
        identity.algorithm,
        "proposal",
        {"x": 2},
        signature,
        expected_digest=d,
    )


def test_signature_rejects_modified_signature():
    identity = new_identity()
    _, signature = sign(identity, "proposal", {"x": 1})
    forged = bytearray(signature)
    forged[-1] ^= 1
    assert not verify(
        identity.public_key,
        identity.algorithm,
        "proposal",
        {"x": 1},
        bytes(forged),
    )


def test_signature_rejects_wrong_public_key():
    first = new_identity()
    second = new_identity()
    _, signature = sign(first, "proposal", {"x": 1})
    assert not verify(
        second.public_key,
        second.algorithm,
        "proposal",
        {"x": 1},
        signature,
    )


def test_transport_roundtrip_protects_actual_payload():
    result = transport_roundtrip(b'{"proposal":"example"}')
    assert result["verified"] is True
    assert result["ciphertext_len"] > len(b'{"proposal":"example"}')


def test_crypto_mode_matches_runtime():
    if PQC_OK:
        assert "ML-DSA-87" in crypto_mode()
    else:
        assert crypto_mode() == "classical-test-fallback"


def _valid_block(registry=None, *, offline=None):
    registry = registry or make_registry()
    offline = offline or []
    proposer = registry[0]
    proposal = {
        "network": NETWORK_ID,
        "height": 1,
        "prev_hash": "a" * 128,
        "request_id": "req",
        "request_digest": "b" * 128,
        "decision": {"outcome": "approve", "score": 0.1},
        "qkd_summary": {
            "qber": 0.0,
            "qber_upper": 0.05,
            "passed": True,
            "reason": "accepted",
        },
        "cell_transition": {"from_height": 0, "to_height": 1},
        "policy_version": POLICY_VERSION,
    }
    proposal_digest, proposal_signature = sign(proposer.identity, "proposal", proposal)
    certificate = make_certificate(
        registry, 1, "a" * 128, proposal_digest, True, offline
    )
    block = {
        "height": 1,
        "prev_hash": "a" * 128,
        "proposal": proposal,
        "proposal_digest": proposal_digest.hex(),
        "proposer_cell_id": proposer.cell_id,
        "proposer_algorithm": proposer.identity.algorithm,
        "proposal_signature_digest": proposal_digest.hex(),
        "proposal_signature": proposal_signature.hex(),
        "certificate": certificate,
    }
    return registry, block


def test_registry_has_nine_unique_cells():
    registry = make_registry()
    assert len(registry) == 9
    assert len({cell.cell_id for cell in registry}) == 9


def test_three_offline_still_meets_six_of_nine_quorum():
    registry, block = _valid_block(offline=[0, 1, 2])
    assert len(block["certificate"]["votes"]) == QUORUM
    assert verify_block(block, registry) == (True, "ok")


def test_four_offline_fails_quorum():
    registry, block = _valid_block(offline=[0, 1, 2, 3])
    ok, reason = verify_block(block, registry)
    assert not ok
    assert reason == "quorum_not_met:5"


def test_verify_block_ok():
    registry, block = _valid_block()
    assert verify_block(block, registry) == (True, "ok")


def test_verify_block_rejects_duplicate_cell():
    registry, block = _valid_block()
    block["certificate"]["votes"].append(deepcopy(block["certificate"]["votes"][0]))
    ok, reason = verify_block(block, registry)
    assert not ok
    assert reason == "duplicate_cell_id"


def test_verify_block_rejects_unknown_cell():
    registry, block = _valid_block()
    block["certificate"]["votes"][0]["cell_id"] = "cell-99"
    ok, reason = verify_block(block, registry)
    assert not ok
    assert reason == "unknown_cell"


def test_verify_block_rejects_wrong_network():
    registry, block = _valid_block()
    block["proposal"]["network"] = "OTHER"
    ok, reason = verify_block(block, registry)
    assert not ok
    assert reason in {"proposal_network_mismatch", "proposal_digest_mismatch"}


def test_verify_block_rejects_wrong_policy():
    registry, block = _valid_block()
    block["certificate"]["policy_version"] = "bad-policy"
    assert verify_block(block, registry)[1] == "certificate_policy_mismatch"


def test_verify_block_rejects_tampered_proposal_digest():
    registry, block = _valid_block()
    block["proposal"]["decision"]["score"] = 0.7
    assert verify_block(block, registry)[1] == "proposal_digest_mismatch"


def test_verify_block_rejects_tampered_proposer_signature():
    registry, block = _valid_block()
    sig = bytearray.fromhex(block["proposal_signature"])
    sig[0] ^= 1
    block["proposal_signature"] = bytes(sig).hex()
    assert verify_block(block, registry)[1] == "bad_proposal_signature"


def test_verify_block_rejects_malformed_input():
    registry = make_registry()
    ok, reason = verify_block({"height": 1}, registry)
    assert not ok and reason == "malformed_block"


@pytest.fixture
def service(tmp_path):
    return FabricService(
        str(tmp_path / "ledger.sqlite3"),
        allow_classical_fallback=True,
        keyvault_master=TEST_MASTER,
    )


def _request(request_id, *, risk=0.0, eve=False, offline=None, telemetry=None):
    return RunRequest(
        request_id=request_id,
        quantum=QuantumConfig(intercept_resend=eve),
        observation=Observation(
            telemetry=telemetry or [0.01, 0.02],
            declared_risk=risk,
        ),
        offline_cells=offline or [],
    )


def test_service_status_genesis(service):
    status = service.status()
    assert status.height == 0
    assert status.integrity is True
    assert len(status.cells) == 9


def test_service_cells_table_contains_no_secret_key(service):
    conn = sqlite3.connect(service.db_path)
    try:
        columns = [row[1] for row in conn.execute("PRAGMA table_info(cells)")]
    finally:
        conn.close()
    assert "secret_key" not in columns
    assert columns == ["idx", "public_key", "algorithm"]


def test_service_run_approve_advances_chain(service):
    before = service.head()
    response = service.run(_request("approve-1"))
    after = service.head()
    assert response.outcome == "approve"
    assert response.block is not None
    assert after[0] == before[0] + 1


def test_service_high_risk_reject_does_not_advance(service):
    before = service.head()
    response = service.run(_request("reject-1", risk=0.95))
    assert response.outcome == "reject"
    assert response.block is None
    assert service.head() == before


def test_service_channel_failure_is_reject_not_approve(service):
    before = service.head()
    response = service.run(_request("eve-1", eve=True))
    assert response.qkd["passed"] is False
    assert response.outcome == "reject"
    assert response.block is None
    assert service.head() == before


def test_service_no_quorum_with_four_offline(service):
    before = service.head()
    response = service.run(_request("quorum-1", offline=[0, 1, 2, 3]))
    assert response.outcome == "no_quorum"
    assert response.votes == 5
    assert service.head() == before


def test_service_six_votes_commit(service):
    response = service.run(_request("quorum-2", offline=[0, 1, 2]))
    assert response.outcome == "approve"
    assert response.votes == 6


def test_service_idempotency_returns_cached_without_appending(service):
    first = service.run(_request("same-1"))
    head = service.head()
    second = service.run(_request("same-1"))
    assert first.cached is False
    assert second.cached is True
    assert service.head() == head


def test_service_same_id_different_input_conflicts(service):
    service.run(_request("same-2", risk=0.0))
    with pytest.raises(RequestConflictError):
        service.run(_request("same-2", risk=0.9))


def test_service_ledger_pagination(service):
    for i in range(3):
        service.run(_request(f"page-{i}"))
    page1 = service.ledger(-1, 2)
    assert len(page1["blocks"]) == 2
    assert page1["next_cursor"] == 1
    page2 = service.ledger(page1["next_cursor"], 2)
    assert [block["height"] for block in page2["blocks"]] == [2, 3]


def test_service_restart_preserves_head_and_signer_registry(tmp_path):
    path = str(tmp_path / "restart.sqlite3")
    first = FabricService(
        path,
        allow_classical_fallback=True,
        keyvault_master=TEST_MASTER,
    )
    first.run(_request("restart-1"))
    head = first.head()
    keys = [cell.identity.public_key for cell in first.registry]

    second = FabricService(
        path,
        allow_classical_fallback=True,
        keyvault_master=TEST_MASTER,
    )
    assert second.head() == head
    assert [cell.identity.public_key for cell in second.registry] == keys
    assert second.status().integrity is True


def test_service_detects_block_json_tamper(service):
    service.run(_request("tamper-block"))
    conn = sqlite3.connect(service.db_path)
    try:
        raw = conn.execute("SELECT block_json FROM chain WHERE height=1").fetchone()[0]
        block = json.loads(raw)
        block["proposal"]["decision"]["score"] = 0.7
        conn.execute(
            "UPDATE chain SET block_json=? WHERE height=1",
            (json.dumps(block),),
        )
        conn.commit()
    finally:
        conn.close()
    assert service.status().integrity is False


def test_service_detects_head_hash_tamper(service):
    service.run(_request("tamper-head"))
    conn = sqlite3.connect(service.db_path)
    try:
        conn.execute(
            "UPDATE chain SET head_hash=? WHERE height=1",
            ("f" * 128,),
        )
        conn.commit()
    finally:
        conn.close()
    assert service.status().integrity is False


def test_service_verify_distinguishes_valid_and_included(service):
    response = service.run(_request("verify-1"))
    result = service.verify(response.block)
    assert result == {
        "certificate_valid": True,
        "reason": "ok",
        "included_in_local_ledger": True,
    }


def test_service_verify_malformed_never_raises(service):
    result = service.verify({"height": 1})
    assert result["certificate_valid"] is False
    assert result["included_in_local_ledger"] is False


def test_outcome_proof_is_cryptographically_verifiable(service):
    response = service.run(_request("proof-1"))
    proof = response.outcome_proof
    signer = next(
        cell for cell in service.registry
        if cell.cell_id == proof["signer_cell_id"]
    )
    assert verify(
        signer.identity.public_key,
        proof["algorithm"],
        "outcome",
        proof["payload"],
        bytes.fromhex(proof["signature"]),
        expected_digest=bytes.fromhex(proof["digest"]),
    )


@pytest.mark.skipif(os.name != "posix", reason="POSIX file mode")
def test_database_file_mode_is_owner_only(service):
    assert (os.stat(service.db_path).st_mode & 0o777) == 0o600


def test_service_fails_closed_without_pqc_unless_explicit_fallback(tmp_path):
    strict = FabricService(
        str(tmp_path / "strict.sqlite3"),
        allow_classical_fallback=False,
        keyvault_master=TEST_MASTER,
    )
    response = strict.run(_request("strict-1"))
    if PQC_OK:
        assert response.outcome == "approve"
    else:
        assert response.outcome == "reject"
        stage = next(s for s in response.stages if s.name == "lattice_protection")
        assert stage.passed is False


def test_request_digest_changes_with_input(service):
    a = _request("digest-a", risk=0.0)
    b = _request("digest-b", risk=0.9)
    assert service._request_digest(a) != service._request_digest(b)
