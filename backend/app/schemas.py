from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

class RegistrationCreate(BaseModel):
    mode: Literal["individual", "school"]
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    phone_verification_token: str | None = Field(default=None, max_length=4096)
    class_level: Literal["9", "11"]
    school: str | None = Field(default=None, max_length=180)
    city: str | None = Field(default=None, max_length=120)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value):
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("Please enter a valid full name.")
        return value

    @field_validator("school", "city", "phone")
    @classmethod
    def strip_optional(cls, value):
        if value is None:
            return None
        value = value.strip()
        return value or None

    @field_validator("school")
    @classmethod
    def require_school_fields(cls, value, info):
        # Cross-field validation happens in model_validator below instead.
        return value

    @classmethod
    def model_validate(cls, obj, **kwargs):
        return super().model_validate(obj, **kwargs)

class RegistrationOut(BaseModel):
    id: int
    registration_code: str
    mode: str
    name: str
    email: EmailStr
    phone: str | None
    class_level: str
    school: str | None
    city: str | None
    created_at: datetime
    confirmation_email_sent: bool = False
    model_config = ConfigDict(from_attributes=True)


class CourseDashboardOut(BaseModel):
    course_id: Literal["road-to-future"]
    title: str
    overview: str
    live_classes: dict
    recorded_classes: dict
    resources: dict


class AdminLogin(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=256)

class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def clean_signup_name(cls, value):
        return " ".join(value.split())

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class GoogleLogin(BaseModel):
    credential: str = Field(min_length=20, max_length=10000)

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    has_password: bool
    google_linked: bool
    marketing_opt_in: bool
    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    marketing_opt_in: bool | None = None

    @field_validator("name")
    @classmethod
    def clean_profile_name(cls, value):
        if value is None:
            return None
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("Please enter a valid name.")
        return value

class PasswordChange(BaseModel):
    # Required when the account already has a password; omitted for Google-only accounts setting one.
    current_password: str | None = Field(default=None, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

class DeleteAccount(BaseModel):
    password: str | None = Field(default=None, max_length=128)
    confirm: Literal["DELETE"]

class SessionOut(BaseModel):
    expires_at: datetime
    has_password: bool
    google_linked: bool

ENQUIRY_SERVICES = Literal["AI & Intelligent Agents", "Digital Experiences", "Engineering & Automation", "Early access", "Something else"]

class EnquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: str | None = Field(default=None, max_length=180)
    service: ENQUIRY_SERVICES
    message: str = Field(min_length=10, max_length=4000)
    website: str | None = Field(default=None, max_length=200)  # honeypot: real users never fill this

    @field_validator("name", "company")
    @classmethod
    def clean_text(cls, value):
        if value is None:
            return None
        value = " ".join(value.split())
        return value or None

class EnquiryOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    company: str | None
    service: str
    message: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EnquiryAck(BaseModel):
    ok: bool = True
