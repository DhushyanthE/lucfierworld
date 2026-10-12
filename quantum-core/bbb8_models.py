"""Pydantic v2 request/response schemas for the BBB8 research pipeline."""
from __future__ import annotations

import math
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Normalized = Annotated[float, Field(ge=0.0, le=1.0)]


class QuantumConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pairs: Annotated[int, Field(ge=128, le=200_000)] = 4096
    seed: Annotated[int, Field(ge=0, le=2**31 - 1)] = 7
    sample_fraction: Annotated[float, Field(gt=0.0, le=0.5)] = 0.25
    intercept_resend: bool = False


class Observation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    telemetry: Annotated[list[Normalized], Field(min_length=1, max_length=4096)]
    declared_risk: Normalized = 0.0
    image_grid: list[list[Normalized]] | None = None

    @field_validator("telemetry")
    @classmethod
    def _telemetry_finite(cls, value: list[float]) -> list[float]:
        if not all(math.isfinite(float(x)) for x in value):
            raise ValueError("telemetry values must be finite")
        return value

    @field_validator("image_grid")
    @classmethod
    def _grid_shape(cls, value):
        if value is None:
            return value
        if not (1 <= len(value) <= 32):
            raise ValueError("image_grid rows must be 1..32")
        width = len(value[0])
        if not (1 <= width <= 32) or any(len(row) != width for row in value):
            raise ValueError("image_grid must be rectangular, 1..32 per side")
        if not all(math.isfinite(float(x)) for row in value for x in row):
            raise ValueError("image_grid values must be finite")
        return value


class RunRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_id: Annotated[
        str,
        Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_\-]+$"),
    ]
    quantum: QuantumConfig = Field(default_factory=QuantumConfig)
    observation: Observation
    offline_cells: list[int] = Field(default_factory=list)

    @field_validator("offline_cells")
    @classmethod
    def _valid_offline(cls, value: list[int]) -> list[int]:
        if len(value) != len(set(value)):
            raise ValueError("offline_cells must be unique")
        if any(i < 0 or i >= 9 for i in value):
            raise ValueError("offline_cells indices must be 0..8")
        return value


class StageReport(BaseModel):
    name: str
    passed: bool
    detail: dict


class RunResponse(BaseModel):
    request_id: str
    request_digest: str
    outcome: Literal["approve", "review", "reject", "no_quorum"]
    stages: list[StageReport]
    qkd: dict
    decision: dict
    protection: dict
    votes: int
    block: dict | None = None
    outcome_proof: dict
    cached: bool = False


class StatusResponse(BaseModel):
    network_id: str
    height: int
    head_hash: str
    integrity: bool
    cells: list[dict]
    crypto_mode: str


class LedgerPage(BaseModel):
    blocks: list[dict]
    next_cursor: int | None
