from fastapi import APIRouter
from src.audit_chain import verify_chain_integrity

router = APIRouter(tags=["audit"])


@router.get("/api/audit/verify")
async def verify_audit() -> dict[str, object]:
    """Verify the integrity of the audit chain."""
    result = await verify_chain_integrity()
    return result
