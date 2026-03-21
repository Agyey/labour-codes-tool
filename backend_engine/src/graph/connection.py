import hashlib
from loguru import logger
from neo4j import AsyncGraphDatabase, AsyncDriver
from src.settings import settings

_driver: AsyncDriver | None = None


async def get_driver() -> AsyncDriver:
    """Lazy singleton for the Neo4j async driver."""
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password.get_secret_value()),
        )
        try:
            await _driver.verify_connectivity()
            logger.info("Neo4j graph database connected.")
        except Exception as e:
            error_msg = str(e).lower()
            if "routing" in error_msg or "serviceunavailable" in error_msg:
                if settings.neo4j_uri.startswith("neo4j://"):
                    logger.warning(
                        f"Neo4j routing failed: {e}. Falling back to bolt://"
                    )
                    await _driver.close()
                    fallback_uri = settings.neo4j_uri.replace("neo4j://", "bolt://", 1)
                    _driver = AsyncGraphDatabase.driver(
                        fallback_uri,
                        auth=(
                            settings.neo4j_user,
                            settings.neo4j_password.get_secret_value(),
                        ),
                    )
                    await _driver.verify_connectivity()
                    logger.info("Neo4j graph database connected using bolt fallback.")
                else:
                    raise
            else:
                raise
    return _driver


async def close_driver() -> None:
    """Gracefully close the Neo4j driver."""
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None
        logger.info("Neo4j driver closed.")


def content_hash(text: str) -> str:
    """SHA-256 hash for content integrity verification."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
