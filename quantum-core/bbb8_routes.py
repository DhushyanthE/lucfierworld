"""FastAPI router exposing the BBB8 research endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from bbb8_models import RunRequest, RunResponse, StatusResponse
from bbb8_service import (
    ConcurrentHeadError,
    FabricService,
    IntegrityError,
    RequestConflictError,
)


class LedgerQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")
    after_height: int = Field(default=-1, ge=-1)
    limit: int = Field(default=20, ge=1, le=100)


class VerifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    block: dict


class CheckpointRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    network: str
    height: int = Field(ge=0)
    head_hash: str = Field(min_length=128, max_length=128)


class _State:
    service: FabricService | None = None


def get_service() -> FabricService:
    if _State.service is None:
        _State.service = FabricService()
    return _State.service


def set_service_for_tests(service: FabricService | None) -> None:
    _State.service = service


router = APIRouter(prefix="/v1/fabric", tags=["BBB8"])


@router.post("/run", response_model=RunResponse)
def run(req: RunRequest):
    try:
        return get_service().run(req)
    except RequestConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ConcurrentHeadError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except IntegrityError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/status", response_model=StatusResponse)
def status():
    try:
        return get_service().status()
    except IntegrityError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/ledger")
def ledger(q: LedgerQuery):
    return get_service().ledger(q.after_height, q.limit)


@router.post("/verify")
def verify(v: VerifyRequest):
    return get_service().verify(v.block)


@router.post("/checkpoint")
def checkpoint():
    return get_service().external_checkpoint()


@router.post("/checkpoint/verify")
def verify_checkpoint(v: CheckpointRequest):
    return {
        "valid": get_service().verify_external_checkpoint(v.model_dump()),
        "checkpoint": v.model_dump(),
        "note": (
            "This compares a checkpoint with local history; the checkpoint "
            "source must be authenticated out-of-band."
        ),
    }
