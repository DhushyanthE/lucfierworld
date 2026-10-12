"""Lightweight FastAPI application exposing BBB8 and a local lab page."""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

from bbb8_routes import router

app = FastAPI(
    title="QuantumSynapse BBB8 Research Lab",
    version="v20.1",
    description=(
        "Local research simulation: Bell/BBM92-style sampling, narrow QML "
        "decision policy, post-quantum signatures when pqcrypto is installed, "
        "and a signed nine-software-cell SQLite ledger."
    ),
)
app.include_router(router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "bbb8",
        "version": "v20.1",
        "boundary": "local research simulation",
    }


@app.get("/lab", response_class=HTMLResponse)
def lab():
    html = Path(__file__).with_name("bbb8_lab.html")
    return HTMLResponse(html.read_text(encoding="utf-8"))
