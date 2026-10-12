"""Regression helpers for the corrected legacy entangled-optimizer convention."""
from __future__ import annotations

import math
import numpy as np


def basis_index(active_qubits: list[int], num_qubits: int) -> int:
    if num_qubits < 1:
        raise ValueError("num_qubits must be positive")
    if len(active_qubits) != len(set(active_qubits)):
        raise ValueError("qubits must be unique")
    if any(q < 0 or q >= num_qubits for q in active_qubits):
        raise ValueError("qubit index out of range")
    value = 0
    for qubit in active_qubits:
        value |= 1 << qubit
    return value


def ghz_phase_state(num_qubits: int, theta: float) -> np.ndarray:
    if num_qubits < 2 or num_qubits > 20:
        raise ValueError("num_qubits must be 2..20")
    if not math.isfinite(theta):
        raise ValueError("theta must be finite")
    state = np.zeros(1 << num_qubits, dtype=np.complex128)
    state[0] = math.cos(theta / 2.0)
    state[(1 << num_qubits) - 1] = -1j * math.sin(theta / 2.0)
    return state


def reduced_qubit_density(state: np.ndarray, num_qubits: int, qubit: int) -> np.ndarray:
    if state.shape != (1 << num_qubits,):
        raise ValueError("state has wrong dimension")
    if qubit < 0 or qubit >= num_qubits:
        raise ValueError("qubit index out of range")

    rho = np.zeros((2, 2), dtype=np.complex128)
    mask = ~(1 << qubit)
    for i, amplitude_i in enumerate(state):
        bit_i = (i >> qubit) & 1
        rest_i = i & mask
        for bit_j in (0, 1):
            j = rest_i | (bit_j << qubit)
            rho[bit_i, bit_j] += amplitude_i * np.conjugate(state[j])
    return rho


def purity(rho: np.ndarray) -> float:
    if rho.shape != (2, 2):
        raise ValueError("rho must be 2x2")
    return float(np.real(np.trace(rho @ rho)))
