"""Opt-in live Supabase RLS smoke test for BBB8-related deployment checks.

This test never hardcodes credentials and intentionally skips unless all three
variables are set:
  SUPABASE_URL
  SUPABASE_ANON_KEY
  BBB8_SUPABASE_RLS_TABLE

It verifies only the anonymous-read boundary for the named table. A 200 response
is acceptable only when RLS returns an empty array. For stronger owner-vs-other
user checks, use the project's authenticated database security suite.
"""
from __future__ import annotations

import os

import httpx
import pytest

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
RLS_TABLE = os.getenv("BBB8_SUPABASE_RLS_TABLE", "")

pytestmark = pytest.mark.skipif(
    not (SUPABASE_URL and SUPABASE_ANON_KEY and RLS_TABLE),
    reason=(
        "live Supabase RLS smoke test is opt-in; set SUPABASE_URL, "
        "SUPABASE_ANON_KEY and BBB8_SUPABASE_RLS_TABLE"
    ),
)


def test_anon_cannot_read_protected_rows():
    url = f"{SUPABASE_URL}/rest/v1/{RLS_TABLE}?select=*"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Accept": "application/json",
    }
    response = httpx.get(url, headers=headers, timeout=15.0)
    if response.status_code == 200:
        assert response.json() == [], (
            f"RLS leak: anonymous client can read rows from {RLS_TABLE}"
        )
    else:
        assert response.status_code in (401, 403), (
            f"unexpected Supabase response {response.status_code}: "
            f"{response.text[:300]}"
        )
