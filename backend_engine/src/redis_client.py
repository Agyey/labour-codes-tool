import redis.asyncio as redis
from src.settings import settings
import json
import typing

# Create a connection pool / client using the settings
redis_db: redis.Redis = redis.from_url(settings.redis_url, decode_responses=True)  # type: ignore[no-untyped-call]


async def publish_sse_event(
    document_id: str, event_name: str, data: dict[str, typing.Any]
) -> None:
    """Format and publish an SSE event to Redis PubSub and history list."""
    event_str = f"event: {event_name}\ndata: {json.dumps(data)}\n\n"

    # Store in history list (tail-capped to 500 events just in case)
    history_key = f"analysis:history:{document_id}"
    await redis_db.rpush(history_key, event_str)  # type: ignore[misc]
    await redis_db.expire(history_key, 86400)  # Expire after 24h

    # Publish to active subscribers
    channel = f"analysis:stream:{document_id}"
    await redis_db.publish(channel, event_str)


async def publish_sse_done(document_id: str) -> None:
    """Publish a termination marker to close the stream."""
    channel = f"analysis:stream:{document_id}"
    await redis_db.publish(channel, "[DONE]")
