from .base import Base, TimestampMixin

from .document import Document
from .structural_unit import StructuralUnit
from .definition import Definition
from .applicability_condition import ApplicabilityCondition
from .cross_reference import CrossReference
from .amendment_history import AmendmentHistory
from .compliance_obligation import ComplianceObligation

from .authority import Authority
from .transaction_type import TransactionType
from .authority_provision_link import AuthorityProvisionLink
from .transaction_provision_link import TransactionProvisionLink

from .stamp_duty_schedule import StampDutySchedule
from .fee_schedule import FeeSchedule
from .rate_slab_schedule import RateSlabSchedule

from .notification_circular import NotificationCircular
from .delegation_of_power import DelegationOfPower
from .rights_and_remedies import RightsAndRemedies

from .conditions_precedent_consequent import ConditionsPrecedentConsequent
from .repeal_mapping import RepealMapping
from .form_template import FormTemplate
from .judicial_interpretation import JudicialInterpretation
from .point_in_time_snapshot import PointInTimeSnapshot

# Expose all models for Alembic to auto-detect metadata
__all__ = [
    "Base",
    "TimestampMixin",
    "Document",
    "StructuralUnit",
    "Definition",
    "ApplicabilityCondition",
    "CrossReference",
    "AmendmentHistory",
    "ComplianceObligation",
    "Authority",
    "TransactionType",
    "AuthorityProvisionLink",
    "TransactionProvisionLink",
    "StampDutySchedule",
    "FeeSchedule",
    "RateSlabSchedule",
    "NotificationCircular",
    "DelegationOfPower",
    "RightsAndRemedies",
    "ConditionsPrecedentConsequent",
    "RepealMapping",
    "FormTemplate",
    "JudicialInterpretation",
    "PointInTimeSnapshot",
]
