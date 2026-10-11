from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Integer, String, Text, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(256), nullable=True)
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    # Incremented to invalidate every previously issued token (password change, "sign out other sessions").
    token_version: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    marketing_opt_in: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    @property
    def has_password(self) -> bool:
        return bool(self.password_hash)

    @property
    def google_linked(self) -> bool:
        return bool(self.google_sub)

class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (
        Index("ix_registrations_mode_created", "mode", "created_at"),
        Index("ix_registrations_email", "email"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    registration_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    mode: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    class_level: Mapped[str] = mapped_column(String(2), nullable=False)
    school: Mapped[str | None] = mapped_column(String(180), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class Enquiry(Base):
    __tablename__ = "enquiries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, index=True)
    company: Mapped[str | None] = mapped_column(String(180), nullable=True)
    service: Mapped[str] = mapped_column(String(60), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
