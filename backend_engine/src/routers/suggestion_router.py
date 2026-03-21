import typing
import prisma
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query, Request
from loguru import logger

from src.database import db
from src.audit_chain import record_audit
from src.settings import settings
from src.limiter import limiter

router = APIRouter(tags=["suggestions"])


@router.patch("/api/suggestions/{suggestion_id}/approve")
@limiter.limit(f"{settings.rate_limit_rpm}/minute")
async def approve_suggestion(
    request: Request,
    suggestion_id: str,
    framework_id: str = Query(default=""),
    provision_id: str = Query(default=""),
) -> dict[str, str]:
    """Approve a suggestion and materialize it into the target module."""
    suggestion = await db.documentsuggestion.find_unique(where={"id": suggestion_id})
    if not suggestion:
        raise HTTPException(404, "Suggestion not found.")
    if suggestion.status != "pending":
        raise HTTPException(400, f"Suggestion already {suggestion.status}.")
    if suggestion.suggested_data is None:
        raise HTTPException(400, "Suggestion data is empty.")

    data = typing.cast(dict[str, object], suggestion.suggested_data)
    try:
        match suggestion.type:
            case "create_legislation":
                if not framework_id:
                    raise HTTPException(
                        400, "framework_id is required to create legislation."
                    )
                await db.legislation.create(
                    data={
                        "name": str(data.get("name", "")),
                        "short_name": str(data.get("short_name", "")),
                        "year": int(str(data.get("year", 0))),
                        "type": str(data.get("type", "act")),
                        "framework_id": framework_id,
                    }
                )

            case "create_provision":
                await db.provision.create(
                    data={
                        "code": str(data.get("short_name", "")),
                        "chapter": str(data.get("chapter", "")),
                        "chapter_name": str(data.get("chapter_name", "")),
                        "section": str(data.get("section", "")),
                        "sub_section": "1",
                        "title": str(data.get("title", "")),
                        "summary": str(data.get("summary", "")),
                        "full_text": str(data.get("full_text", "")),
                        "sub_sections": prisma.Json(
                            typing.cast(
                                list[dict[str, object]], data.get("sub_sections", [])
                            )
                        ),
                        "impact": "Pending Review",
                        "rule_authority": "Appropriate Government",
                        "status": "active",
                        "provision_type": "section",
                    }
                )

            case "create_compliance_item":
                if not provision_id:
                    raise HTTPException(
                        400, "provision_id is required to create a compliance item."
                    )
                await db.complianceitem.create(
                    data={
                        "provision_id": provision_id,
                        "task": f"{data.get('task')} ({data.get('due_logic')})",
                        "status": "Not Started",
                    }
                )

            case "create_penalty":
                logger.info(
                    f"Penalty suggestion approved. Modifying tracking for section {data.get('section')}"
                )

            case "create_definition":
                logger.info(f"Definition suggestion approved: {data.get('term')}")

            case "flag_repeal":
                logger.info(f"Flagging repeal: {data.get('repealed_act_name')}")

        await db.documentsuggestion.update(
            where={"id": suggestion_id},
            data={
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc),
            },
        )

        await record_audit(
            action="suggestion_approved",
            entity_type="suggestion",
            entity_id=suggestion_id,
            data={"type": suggestion.type, "target": suggestion.target_module},
        )

        return {
            "message": "Suggestion approved and materialized.",
            "status": "approved",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Approval failed: {e}")
        raise HTTPException(500, f"Approval failed: {str(e)}")


@router.patch("/api/suggestions/{suggestion_id}/reject")
async def reject_suggestion(
    suggestion_id: str, reason: str = Query(default="")
) -> dict[str, str]:
    """Reject a suggestion with optional reason."""
    suggestion = await db.documentsuggestion.find_unique(where={"id": suggestion_id})
    if not suggestion:
        raise HTTPException(404, "Suggestion not found.")

    await db.documentsuggestion.update(
        where={"id": suggestion_id},
        data={
            "status": "rejected",
            "rejection_reason": reason,
            "reviewed_at": datetime.now(timezone.utc),
        },
    )

    await record_audit(
        action="suggestion_rejected",
        entity_type="suggestion",
        entity_id=suggestion_id,
        data={"type": suggestion.type, "reason": reason},
    )

    return {"message": "Suggestion rejected.", "status": "rejected"}
