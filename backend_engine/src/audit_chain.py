"""Blockchain-style audit chain for compliance tamper-proof logging.

Every significant action (approve suggestion, create provision, etc.)
is hashed into an immutable chain stored in Postgres.
"""

import hashlib
import json
import typing
from datetime import datetime, timezone

from loguru import logger

from src.database import db


async def get_last_hash() -> str:
    """Get the hash of the last entry in the chain (genesis if empty)."""
    last = await db.auditchain.find_first(order={"created_at": "desc"})
    if last:
        return last.current_hash
    return "0" * 64  # Genesis hash


def compute_hash(
    previous_hash: str,
    action: str,
    entity_type: str,
    entity_id: str,
    data: dict[str, typing.Any],
    timestamp: str,
) -> str:
    """Compute SHA-256 hash for the chain entry."""
    payload = json.dumps(
        {
            "previous_hash": previous_hash,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "data": data,
            "timestamp": timestamp,
        },
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


async def record_audit(
    action: str,
    entity_type: str,
    entity_id: str,
    data: dict[str, typing.Any],
    user_id: str | None = None,
) -> str:
    """Append a new entry to the audit chain. Returns the new hash."""
    previous_hash = await get_last_hash()
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    current_hash = compute_hash(
        previous_hash, action, entity_type, entity_id, data, now_iso
    )

    await db.auditchain.create(
        data={
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "data_snapshot": json.dumps(data),
            "previous_hash": previous_hash,
            "current_hash": current_hash,
            "performed_by": user_id,
            "created_at": now,
        }
    )

    logger.info(
        f"Audit chain: {action} on {entity_type}/{entity_id} → {current_hash[:16]}..."
    )
    return current_hash


async def verify_chain_integrity() -> dict[str, typing.Any]:
    """Verify the entire audit chain has not been tampered with."""
    entries = await db.auditchain.find_many(order={"created_at": "asc"})
    if not entries:
        return {"valid": True, "entries": 0}

    expected_prev = "0" * 64  # Genesis
    invalid_entries: list[str] = []

    for entry in entries:
        if entry.previous_hash != expected_prev:
            invalid_entries.append(entry.id)
        expected_prev = entry.current_hash

    return {
        "valid": len(invalid_entries) == 0,
        "entries": len(entries),
        "invalid_entries": invalid_entries,
    }
