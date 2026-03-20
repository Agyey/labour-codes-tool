"""Enrichment pipeline package.

Import order matters: passes are run sequentially 1→6 by the orchestrator.
"""
from src.enrichment.orchestrator import run_enrichment

__all__ = ["run_enrichment"]
