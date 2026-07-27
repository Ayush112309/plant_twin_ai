from pydantic import BaseModel, EmailStr
from typing import Optional
from app.identity.authentication.schemas import TokenResponse

class OrganizationRegistrationRequest(BaseModel):
    organization_name: str
    organization_slug: str
    industry_type: str
    admin_email: EmailStr
    admin_password: str
    admin_first_name: str
    admin_last_name: str

class OrganizationRegistrationResponse(BaseModel):
    user_id: str
    organization_id: str
    token: TokenResponse
