from sqlalchemy import Column, String, Boolean, DateTime, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.mixins.base_model import Base
from app.shared.mixins import UUIDModelMixin, TimestampMixin, SoftDeleteMixin

class Rule(Base, UUIDModelMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "rules"

    name = mapped_column(String, nullable=False)
    description = mapped_column(String, nullable=True)
    rule_type = mapped_column(String, nullable=False) # threshold/expression/schedule
    conditions = mapped_column(JSON, nullable=False)
    actions = mapped_column(JSON, nullable=False) # notification/alarm/webhook
    priority = mapped_column(Integer, default=0, nullable=False)
    is_enabled = mapped_column(Boolean, default=True, nullable=False)
    last_evaluated_at = mapped_column(DateTime, nullable=True)
    evaluation_count = mapped_column(Integer, default=0, nullable=False)
