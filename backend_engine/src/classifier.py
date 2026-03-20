"""Stage 2: Document Type Classifier.

Rule-based regex classifier — zero LLM cost, runs in milliseconds.
Determines doc_type, jurisdiction, appropriate_govt, and parent act hints.

Usage:
    from src.classifier import classify
    result = classify(raw_text[:3000])
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from loguru import logger


# ── State code mapping ────────────────────────────────────────────
STATE_KEYWORDS: dict[str, str] = {
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    "Assam": "AS",
    "Bihar": "BR",
    "Chhattisgarh": "CG",
    "Goa": "GA",
    "Gujarat": "GJ",
    "Haryana": "HR",
    "Himachal Pradesh": "HP",
    "Jharkhand": "JH",
    "Karnataka": "KA",
    "Kerala": "KL",
    "Madhya Pradesh": "MP",
    "Maharashtra": "MH",
    "Manipur": "MN",
    "Meghalaya": "ML",
    "Mizoram": "MZ",
    "Nagaland": "NL",
    "Odisha": "OD",
    "Punjab": "PB",
    "Rajasthan": "RJ",
    "Sikkim": "SK",
    "Tamil Nadu": "TN",
    "Telangana": "TS",
    "Tripura": "TR",
    "Uttar Pradesh": "UP",
    "Uttarakhand": "UK",
    "West Bengal": "WB",
    "Delhi": "DL",
    "Jammu and Kashmir": "JK",
    "Ladakh": "LA",
}

# Acts known to have dual appropriate-govt (central + state both make rules)
DUAL_APPROPRIATE_GOVT_ACTS = [
    "Code on Wages",
    "Occupational Safety, Health and Working Conditions Code",
    "Industrial Relations Code",
    "Code on Social Security",
    "Employees State Insurance",
    "Provident Funds",
]


from src.models import DocumentClassification


def classify(raw_text: str) -> DocumentClassification:
    """Classify a legal document from its raw text (first ~3000 chars recommended).

    Returns a DocumentClassification with doc_type, jurisdiction, and linkage hints.
    """
    # Work with first 3000 characters for speed
    sample = raw_text[:3000].strip()
    sample_lower = sample.lower()

    doc_type = _detect_doc_type(sample, sample_lower)
    jurisdiction = _detect_jurisdiction(sample, sample_lower)
    appropriate_govt = _detect_appropriate_govt(sample, sample_lower, jurisdiction)
    parent_act_hint, parent_act_year, enabling_section_hint = _detect_parent_act(sample)
    is_connector = _is_connector_act(sample, sample_lower)
    is_amendment = doc_type == "amendment"

    result = DocumentClassification(
        doc_type=doc_type,
        jurisdiction=jurisdiction,
        appropriate_govt=appropriate_govt,
        parent_act_hint=parent_act_hint,
        parent_act_year=parent_act_year,
        enabling_section_hint=enabling_section_hint,
        is_connector_act=is_connector,
        is_amendment=is_amendment,
        confidence=_compute_confidence(doc_type, jurisdiction, parent_act_hint),
    )
    logger.info(
        f"Classified document: type={result.doc_type}, jurisdiction={result.jurisdiction}, "
        f"appropriate_govt={result.appropriate_govt}, parent={result.parent_act_hint}, "
        f"confidence={result.confidence:.2f}"
    )
    return result


# ── Internal detectors ────────────────────────────────────────────

def _detect_doc_type(sample: str, sample_lower: str) -> str:
    """Determine the document type via pattern priority."""

    # 1. Amendment Acts — check before principal act
    if re.search(r'\(Amendment\)\s+Act', sample) or re.search(r'\(Amendment\)\s+Bill', sample):
        return "amendment"
    if re.search(r'amend(?:ing|ment)\s+act', sample_lower):
        return "amendment"

    # 2. Case law / judgment
    if re.search(r"\b(?:petitioner|respondent|appellant|plaintiff|defendant)\b", sample_lower):
        if re.search(r"\b(?:Hon['\"]?ble|judgment|order|verdict|decree)\b", sample_lower):
            return "case_law"

    # 3. Notification
    if re.match(r'^(?:S\.O\.|G\.S\.R\.|F\.No\.|NOTIFICATION)', sample.strip()):
        return "notification"
    if re.search(r'^NOTIFICATION\b', sample, re.MULTILINE):
        return "notification"

    # 4. Circular
    if re.match(r'^(?:CIRCULAR|General Circular)', sample.strip()):
        return "circular"
    if re.search(r'^General Circular', sample, re.MULTILINE):
        return "circular"

    # 5. Rules
    if re.search(r'\bRules?,\s+\d{4}\b', sample) and re.search(
        r'exercise of\s+(?:the\s+)?powers? conferred', sample_lower
    ):
        return "rules"
    if re.search(r'Rules?,\s*\d{4}', sample) and "Regulations" not in sample[:200]:
        if "exercise of powers" in sample_lower or "empowered" in sample_lower:
            return "rules"

    # 6. Regulations
    if re.search(r'\bRegulations?,\s+\d{4}\b', sample) and re.search(
        r'exercise of\s+(?:the\s+)?powers? conferred', sample_lower
    ):
        return "regulations"

    # 7. Schedule / Rate document
    if re.search(r'^SCHEDULE\b', sample, re.MULTILINE) and len(sample) < 2000:
        return "schedule"
    if re.search(r'stamp duty schedule|fee schedule|rate schedule', sample_lower):
        return "schedule"

    # 8. Principal Act — enacted by Parliament or Legislature
    if re.search(
        r'Be it enacted by Parliament|enacted by the Legislature|enacted by the President',
        sample,
    ):
        return "principal_act"

    # 9. Sub-legislation fallback
    if re.search(r'\bRules?\b', sample[:300]) and re.search(r'\d{4}', sample[:300]):
        return "rules"

    return "principal_act"  # safe default


def _detect_jurisdiction(sample: str, sample_lower: str) -> str:
    """Detect whether this is a Central or State document."""

    # Central markers
    if re.search(
        r'enacted by Parliament|Ministry of (?:Law|Finance|Labour|Corporate Affairs)',
        sample,
    ):
        return "Central"
    if re.search(r'Government of India|Central Government', sample):
        return "Central"

    # State markers — check longest state names first to avoid partial matches
    for state_name in sorted(STATE_KEYWORDS.keys(), key=len, reverse=True):
        if state_name.lower() in sample_lower:
            if re.search(
                rf'(?:Government of|State of|Legislature of)\s+{re.escape(state_name)}',
                sample,
                re.IGNORECASE,
            ):
                return STATE_KEYWORDS[state_name]
            # Fallback: state name in title area
            if state_name.lower() in sample_lower[:500]:
                return STATE_KEYWORDS[state_name]

    return "Central"


def _detect_appropriate_govt(sample: str, sample_lower: str, jurisdiction: str) -> str:
    """Determine appropriate government level."""

    # Check for dual appropriate-govt acts
    for act_name in DUAL_APPROPRIATE_GOVT_ACTS:
        if act_name.lower() in sample_lower:
            return "both"

    # If it's a state document, appropriate govt is state
    if jurisdiction != "Central":
        return "state"

    # Check explicit appropriate government language
    if re.search(r'"appropriate Government" means.+?State Government', sample, re.DOTALL):
        return "both"
    if re.search(r'appropriate Government', sample):
        if "State Government" in sample and "Central Government" in sample:
            return "both"

    return "central"


def _detect_parent_act(sample: str) -> tuple[str | None, int | None, str | None]:
    """Extract parent act name, year, and enabling section from subordinate legislation."""

    # Pattern: "conferred by section 469 of the Companies Act, 2013"
    match = re.search(
        r'powers?\s+conferred\s+by\s+(?:sub-section\s*\(\d+\)\s+of\s+)?'
        r'(section[\s\d,\(\)and]+)\s+of\s+(?:the\s+)?(.+?Act,?\s*(\d{4}))',
        sample,
        re.IGNORECASE | re.DOTALL,
    )
    if match:
        section_ref = match.group(1).strip()
        act_name = match.group(2).strip().rstrip(",")
        act_year = int(match.group(3)) if match.group(3) else None
        return act_name, act_year, section_ref

    # Amendment pattern: "in the [Act], [year], after section X..."
    match2 = re.search(
        r'In (?:the\s+)?(.+?Act,?\s*(\d{4})),', sample, re.IGNORECASE
    )
    if match2:
        act_name = match2.group(1).strip().rstrip(",")
        act_year = int(match2.group(2)) if match2.group(2) else None
        return act_name, act_year, None

    # "principal Act" reference
    match3 = re.search(r'the principal Act', sample, re.IGNORECASE)
    if match3:
        act_match = re.search(r'(?:the\s+)?(.+?Act,?\s*(\d{4}))', sample[:500], re.IGNORECASE)
        if act_match:
            return act_match.group(1).strip(), int(act_match.group(2)) if act_match.group(2) else None, None

    return None, None, None


def _is_connector_act(sample: str, sample_lower: str) -> bool:
    """Detect connector acts (Stamp Act, Registration, Court Fees)."""
    connector_keywords = [
        "indian stamp act",
        "stamp act",
        "registration act",
        "court fees act",
        "court-fees act",
        "transfer of property",
        "specific relief",
    ]
    for kw in connector_keywords:
        if kw in sample_lower[:500]:
            return True
    return False


def _compute_confidence(doc_type: str, jurisdiction: str, parent_act_hint: str | None) -> float:
    score = 1.0
    if doc_type == "principal_act" and parent_act_hint is not None:
        score -= 0.1  # slight penalty — might be amendment
    if jurisdiction == "Central" and doc_type in {"rules", "regulations"} and parent_act_hint is None:
        score -= 0.15
    return round(max(0.5, score), 2)
