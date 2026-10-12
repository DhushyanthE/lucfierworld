import math

import numpy as np
import pytest

from bbb8_entangled_regression import (
    basis_index,
    ghz_phase_state,
    purity,
    reduced_qubit_density,
)


def test_little_endian_qubit_two_is_integer_four():
    assert basis_index([2], 4) == 0b0100 == 4


@pytest.mark.parametrize(
    "qubits,expected",
    [([0], 1), ([1], 2), ([0, 3], 9), ([0, 1, 2, 3], 15)],
)
def test_little_endian_basis_mapping(qubits, expected):
    assert basis_index(qubits, 4) == expected


def test_theta_pi_over_two_has_correct_ghz_amplitudes():
    state = ghz_phase_state(3, math.pi / 2)
    assert state[0] == pytest.approx(math.sqrt(0.5))
    assert state[-1] == pytest.approx(-1j * math.sqrt(0.5))
    assert np.count_nonzero(np.abs(state) > 1e-12) == 2


@pytest.mark.parametrize("qubit", [0, 1, 2])
def test_theta_pi_over_two_reduced_qubit_is_maximally_mixed(qubit):
    state = ghz_phase_state(3, math.pi / 2)
    rho = reduced_qubit_density(state, 3, qubit)
    assert rho == pytest.approx(np.eye(2) / 2)
    assert purity(rho) == pytest.approx(0.5)


def test_theta_pi_is_product_state_not_ghz_entanglement():
    state = ghz_phase_state(3, math.pi)
    assert abs(state[0]) < 1e-12
    assert state[-1] == pytest.approx(-1j)
    rho = reduced_qubit_density(state, 3, 0)
    assert purity(rho) == pytest.approx(1.0)


@pytest.mark.parametrize("theta", [0.0, math.pi / 4, math.pi / 2, math.pi])
def test_state_is_normalized(theta):
    state = ghz_phase_state(4, theta)
    assert float(np.vdot(state, state).real) == pytest.approx(1.0)
