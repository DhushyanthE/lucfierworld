"""
Local QML-like single-qubit classifier + bounded decision policy.

The model is intentionally narrow. It operates on normalized scalar statistics,
not on raw images and not as an AGI system.

Circuit probability:
    |0> -- H -- Rz(w*x+b) -- H -- measure
    P(0) = (1 + cos(w*x+b)) / 2

Training uses the parameter-shift rule on the circuit angle. For w, the chain
rule contributes the input x.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import math

import numpy as np


def _features(telemetry: list[float], image: list[list[float]] | None) -> dict:
    t = np.asarray(telemetry, dtype=float)
    mean = float(t.mean())
    peak = float(t.max() - t.min())
    diffs = np.abs(np.diff(t))
    max_delta = float(diffs.max()) if diffs.size else 0.0

    img_mean = 0.0
    img_contrast = 0.0
    if image is not None:
        g = np.asarray(image, dtype=float)
        img_mean = float(g.mean())
        img_contrast = float(g.max() - g.min())

    return {
        "mean": mean,
        "peak": peak,
        "max_delta": max_delta,
        "img_mean": img_mean,
        "img_contrast": img_contrast,
    }


def _fused_risk(feats: dict) -> float:
    return float(
        min(
            1.0,
            max(
                0.0,
                feats["mean"],
                feats["peak"],
                feats["max_delta"],
                feats["img_mean"],
                feats["img_contrast"],
            ),
        )
    )


def _qml_probability(x: float, w: float, b: float) -> float:
    angle = w * x + b
    return (1.0 + math.cos(angle)) / 2.0


def _parameter_shift_gradient(x: float, w: float, b: float) -> tuple[float, float]:
    p_plus = _qml_probability(x, w, b + math.pi / 2)
    p_minus = _qml_probability(x, w, b - math.pi / 2)
    d_p_d_angle = (p_plus - p_minus) / 2.0
    return x * d_p_d_angle, d_p_d_angle


@lru_cache(maxsize=1)
def trained_model() -> tuple[float, float, float]:
    rng = np.random.default_rng(7)
    x_train = rng.uniform(-1.0, 1.0, 40)
    y_train = (x_train > 0.0).astype(float)

    w, b = 0.5, 0.0
    learning_rate = 0.20

    for _ in range(40):
        grad_w = 0.0
        grad_b = 0.0
        for x, y in zip(x_train, y_train):
            prediction = _qml_probability(float(x), w, b)
            d_p_dw, d_p_db = _parameter_shift_gradient(float(x), w, b)
            error = prediction - float(y)
            grad_w += 2.0 * error * d_p_dw
            grad_b += 2.0 * error * d_p_db
        w -= learning_rate * grad_w / len(x_train)
        b -= learning_rate * grad_b / len(x_train)

    rng_test = np.random.default_rng(8)
    x_test = rng_test.uniform(-1.0, 1.0, 40)
    y_test = (x_test > 0.0).astype(int)
    predictions = np.array([_qml_probability(float(x), w, b) for x in x_test])
    accuracy = float(((predictions > 0.5).astype(int) == y_test).mean())
    return float(w), float(b), accuracy


@dataclass(frozen=True)
class Decision:
    outcome: str
    score: float
    features: dict
    model_accuracy: float


def analyze(
    telemetry: list[float],
    declared_risk: float,
    image: list[list[float]] | None,
) -> Decision:
    feats = _features(telemetry, image)
    fused = max(_fused_risk(feats), float(declared_risk))
    w, b, accuracy = trained_model()
    x = 2.0 * fused - 1.0
    probability = _qml_probability(x, w, b)
    effective_risk = max(fused, probability)

    if effective_risk >= 0.80:
        outcome = "reject"
    elif effective_risk >= 0.45:
        outcome = "review"
    else:
        outcome = "approve"

    return Decision(
        outcome=outcome,
        score=round(float(effective_risk), 4),
        features=feats,
        model_accuracy=round(float(accuracy), 4),
    )
