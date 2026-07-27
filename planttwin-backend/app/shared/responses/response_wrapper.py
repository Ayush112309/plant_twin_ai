from typing import Generic, TypeVar, Optional, Any, List
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None
    errors: Optional[List[Any]] = None
    meta: Optional[dict] = None

    @classmethod
    def ok(cls, data: Optional[T] = None, message: str = "Success", meta: Optional[dict] = None):
        return cls(success=True, message=message, data=data, meta=meta)

    @classmethod
    def fail(cls, message: str = "Error occurred", errors: Optional[List[Any]] = None):
        return cls(success=False, message=message, errors=errors)
