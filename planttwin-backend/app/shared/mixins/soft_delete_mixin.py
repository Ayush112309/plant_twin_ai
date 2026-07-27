"""Compatibility shim — re-exports SoftDeleteMixin from base_model."""
from app.shared.mixins.base_model import SoftDeleteMixin

__all__ = ["SoftDeleteMixin"]
