"""
Bell-pair sampling + QBER gate for the BBB8 research simulation.

This is a classical simulation of an entanglement-based protocol (BBM92-like),
not a physical QKD implementation. For an ideal |Phi+> Bell pair:

* Alice/Bob using the same X or Z basis are perfectly correlated.
* Different Alice/Bob bases produce a uniform joint distribution.
* A random-basis intercept/resend measurement causes 50% error when Eve chose
  the wrong basis and no error when she chose the right basis, so the expected
  sifted-key QBER is 25%.

The IID diagnostic upper bound used by the research gate is:
    qber_upper = min(1, qber + sqrt(log(100) / (2 * sample_count)))

It is deliberately documented as a simulation diagnostic, not a composable
finite-key proof.
"""
from __future__ import annotations

import math
from dataclasses import asdict, dataclass
from typing import Literal

import numpy as np

Basis = Literal["X", "Z"]

MIN_SAMPLED = 128
MIN_REMAINING = 128
QBER_UPPER_LIMIT = 0.11


@dataclass(frozen=True)
class ChannelReport:
    pairs: int
    sifted: int
    sampled: int
    remaining: int
    mismatches: int
    qber: float
    qber_upper: float
    passed: bool
    reason: str

    def to_dict(self) -> dict:
        return asdict(self)


_UNIFORM = {(0, 0): 0.25, (0, 1): 0.25, (1, 0): 0.25, (1, 1): 0.25}
_CORRELATED = {(0, 0): 0.5, (1, 1): 0.5, (0, 1): 0.0, (1, 0): 0.0}


def joint_probabilities(
    alice_basis: Basis,
    bob_basis: Basis,
    eve_basis: Basis | None,
) -> dict[tuple[int, int], float]:
    """Return the exact P(Alice bit, Bob bit) for the simplified model."""
    if alice_basis not in ("X", "Z") or bob_basis not in ("X", "Z"):
        raise ValueError("Alice/Bob basis must be X or Z")
    if eve_basis not in (None, "X", "Z"):
        raise ValueError("Eve basis must be X, Z or None")

    if alice_basis != bob_basis:
        return dict(_UNIFORM)

    if eve_basis is None or eve_basis == alice_basis:
        return dict(_CORRELATED)

    return dict(_UNIFORM)


def simulate_channel(
    pairs: int,
    seed: int,
    sample_fraction: float,
    intercept_resend: bool,
) -> ChannelReport:
    if not 1 <= pairs <= 200_000:
        raise ValueError("pairs must be 1..200000")
    if not 0.0 < sample_fraction <= 0.5:
        raise ValueError("sample_fraction must be in (0, 0.5]")

    rng = np.random.default_rng(seed)
    alice_basis = rng.choice(np.array(["X", "Z"]), size=pairs)
    bob_basis = rng.choice(np.array(["X", "Z"]), size=pairs)
    eve_basis = (
        rng.choice(np.array(["X", "Z"]), size=pairs)
        if intercept_resend
        else None
    )

    sifted_idx = np.flatnonzero(alice_basis == bob_basis)
    sifted = int(sifted_idx.size)

    if sifted < MIN_SAMPLED + MIN_REMAINING:
        return ChannelReport(
            pairs, sifted, 0, 0, 0, 1.0, 1.0, False, "insufficient_sifted"
        )

    n_sample = max(MIN_SAMPLED, int(sifted * sample_fraction))
    if n_sample >= sifted:
        return ChannelReport(
            pairs, sifted, n_sample, 0, 0, 1.0, 1.0, False, "insufficient_samples"
        )

    sample_pos = rng.choice(sifted_idx, size=n_sample, replace=False)
    remaining = sifted - n_sample

    if remaining < MIN_REMAINING:
        return ChannelReport(
            pairs, sifted, n_sample, remaining, 0, 1.0, 1.0, False,
            "insufficient_samples"
        )

    mismatches = 0
    for pos in sample_pos:
        a_basis = str(alice_basis[pos])
        b_basis = str(bob_basis[pos])
        e_basis = str(eve_basis[pos]) if intercept_resend else None
        probs = joint_probabilities(a_basis, b_basis, e_basis)
        outcomes = tuple(probs)
        probability = np.fromiter((probs[o] for o in outcomes), dtype=float)
        pick = outcomes[int(rng.choice(len(outcomes), p=probability))]
        if pick[0] != pick[1]:
            mismatches += 1

    qber = mismatches / n_sample
    qber_upper = min(
        1.0,
        qber + math.sqrt(math.log(100.0) / (2.0 * n_sample)),
    )

    if qber_upper >= QBER_UPPER_LIMIT:
        return ChannelReport(
            pairs, sifted, n_sample, remaining, mismatches, qber, qber_upper,
            False, "qber_above_threshold"
        )

    return ChannelReport(
        pairs, sifted, n_sample, remaining, mismatches, qber, qber_upper,
        True, "accepted"
    )
