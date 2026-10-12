# QuantumSynapse BBB8 v20.1 — repaired local research package

This package is the executable BBB8 slice reconstructed from the uploaded v20
verification material and then re-tested independently.

## Additional defects found by re-running the attached source

1. `bbb8_consensus.py` used `new_identity()` without importing it.
2. A failed QBER/channel gate could still return `outcome="approve"`.
3. The simplified intercept/resend helper did not model the expected 50% wrong-basis / 25% average disturbance correctly.
4. The classical signature fallback accepted arbitrary same-length signatures in some verification paths.
5. Reusing a request ID with different input returned cached output instead of HTTP 409.
6. Ledger append and outcome storage were not one SQLite transaction.
7. Chain verification checked linkage but did not verify every stored head hash/certificate.
8. QML training shifted `w` itself by ±π/2; the parameter-shift applies to the circuit angle and needs the chain-rule factor `x`.
9. The pasted test file claimed more executable test cases than it actually contained.
10. The old pqcrypto API names were not compatible with current pqcrypto 1.x.

## Verify

```bash
cd quantum-core
python -m pip install -r requirements-test-bbb8.txt
python -m pytest \
  test_bbb8.py \
  test_bbb8_gateways.py \
  test_bbb8_main.py \
  test_entangled_optimizer_regression.py -q
```

The reconstruction passed 122 tests locally. The local sandbox did not have
`pqcrypto`, so its local run exercised the explicit Ed25519/X25519 test
fallback. Normal service policy remains fail-closed on that fallback unless
`BBB8_ALLOW_CLASSICAL_FALLBACK=1` is explicitly enabled.

## Run

```bash
cd quantum-core
python -m uvicorn bbb8_app:app --host 127.0.0.1 --port 8001
```

Open `/lab` or `/docs`.

## Boundary

This is a local research simulation. It does not provide physical QKD,
independent distributed validators, living-cell computation, secure hardware
key custody, or a production blockchain deployment.
