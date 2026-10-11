import csv
import io
import secrets
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .config import settings
from .database import Base, engine, get_db
from .models import Enquiry, Registration, User
from .schemas import (AdminLogin, DeleteAccount, EnquiryAck, EnquiryCreate, EnquiryOut, GoogleLogin, LoginOut,
                      PasswordChange, ProfileUpdate, RegistrationCreate, RegistrationOut, SessionOut, SignupIn, UserLogin, UserOut)
from .security import TOKEN_HOURS, create_access_token, require_admin, require_user, require_user_session, verify_admin, hash_password, verify_password

app = FastAPI(title="Udaan Ocourses API", version="1.0.0", description="Road to Future registration and admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

USER_TOKEN_HOURS = 24 * 30

def issue_user_token(user: User) -> str:
    return create_access_token(f"user:{user.id}", "user", expires_hours=USER_TOKEN_HOURS, token_version=user.token_version or 0)

def token_response(user: User) -> dict:
    return {"access_token": issue_user_token(user), "expires_in": USER_TOKEN_HOURS * 3600}

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "udaan-ocourses-api"}

@app.post("/api/auth/signup", response_model=LoginOut, status_code=201)
def signup(payload: SignupIn, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please sign in.")
    user = User(name=payload.name, email=email, password_hash=hash_password(payload.password))
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    return token_response(user)

@app.post("/api/auth/login", response_model=LoginOut)
def user_login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return token_response(user)

@app.post("/api/auth/google", response_model=LoginOut)
def google_login(payload: GoogleLogin, db: Session = Depends(get_db)):
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured yet.")
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        claims = id_token.verify_oauth2_token(payload.credential, requests.Request(), settings.google_client_id)
        email = str(claims.get("email", "")).lower()
        if not email or not claims.get("email_verified") or not claims.get("sub"):
            raise ValueError("Unverified Google account")
    except Exception as exc:
        import traceback
        traceback.print_exc()
        print(f"Google token verification failed: {type(exc).__name__}")
        raise HTTPException(
            status_code=401,
            detail="Google sign-in could not be verified."
        )
        raise HTTPException(status_code=401, detail="Google sign-in could not be verified. Check that VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID match.")
    user = db.scalar(select(User).where(User.email == email))
    if user:
        if user.google_sub and user.google_sub != claims["sub"]:
            raise HTTPException(status_code=409, detail="This email is linked to another Google account.")
        user.google_sub = claims["sub"]
    else:
        user = User(name=claims.get("name") or email.split("@")[0], email=email, google_sub=claims["sub"])
        db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Could not link this Google account.")
    return token_response(user)

@app.get("/api/auth/me", response_model=UserOut)
def auth_me(session=Depends(require_user_session)):
    return session[0]

@app.patch("/api/auth/me", response_model=UserOut)
def update_me(payload: ProfileUpdate, session=Depends(require_user_session), db: Session = Depends(get_db)):
    user, _ = session
    # Only the authenticated user's own row is ever touched; no user id is accepted from the client.
    if payload.name is not None:
        user.name = payload.name
    if payload.marketing_opt_in is not None:
        user.marketing_opt_in = payload.marketing_opt_in
    db.commit()
    db.refresh(user)
    return user

@app.get("/api/auth/session", response_model=SessionOut)
def auth_session(session=Depends(require_user_session)):
    user, claims = session
    return {"expires_at": datetime.fromtimestamp(claims["exp"], tz=timezone.utc), "has_password": user.has_password, "google_linked": user.google_linked}

@app.post("/api/auth/change-password", response_model=LoginOut)
def change_password(payload: PasswordChange, session=Depends(require_user_session), db: Session = Depends(get_db)):
    user, _ = session
    if user.has_password:
        if not payload.current_password or not verify_password(payload.current_password, user.password_hash):
            raise HTTPException(status_code=403, detail="Current password is incorrect.")
        if payload.current_password == payload.new_password:
            raise HTTPException(status_code=422, detail="Choose a new password that differs from the current one.")
    user.password_hash = hash_password(payload.new_password)
    user.token_version = (user.token_version or 0) + 1  # signs out every other session
    db.commit()
    db.refresh(user)
    return token_response(user)  # fresh token keeps the current device signed in

@app.post("/api/auth/sessions/revoke-others", response_model=LoginOut)
def revoke_other_sessions(session=Depends(require_user_session), db: Session = Depends(get_db)):
    user, _ = session
    user.token_version = (user.token_version or 0) + 1
    db.commit()
    db.refresh(user)
    return token_response(user)

@app.get("/api/auth/me/export")
def export_my_data(session=Depends(require_user_session), db: Session = Depends(get_db)):
    import json
    user, _ = session
    regs = list(db.scalars(select(Registration).where(Registration.user_id == user.id).order_by(Registration.created_at.desc())).all())
    data = {
        "account": {"id": user.id, "name": user.name, "email": user.email, "created_at": user.created_at.isoformat(), "marketing_opt_in": user.marketing_opt_in, "google_linked": user.google_linked, "has_password": user.has_password},
        "registrations": [{"registration_code": r.registration_code, "mode": r.mode, "name": r.name, "email": r.email, "phone": r.phone, "class_level": r.class_level, "school": r.school, "city": r.city, "created_at": r.created_at.isoformat()} for r in regs],
        "exported_at": datetime.now(timezone.utc).isoformat(),
    }
    return Response(json.dumps(data, ensure_ascii=False, indent=2), media_type="application/json", headers={"Content-Disposition": 'attachment; filename="udaan-my-data.json"'})

@app.post("/api/auth/delete-account", status_code=204)
def delete_account(payload: DeleteAccount, session=Depends(require_user_session), db: Session = Depends(get_db)):
    user, _ = session
    if user.has_password:
        if not payload.password or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=403, detail="Password is incorrect.")
    # Registrations contain the user's personal details, so they are deleted with the account.
    for reg in db.scalars(select(Registration).where(Registration.user_id == user.id)).all():
        db.delete(reg)
    db.delete(user)
    db.commit()
    return Response(status_code=204)

# --- Contact / project enquiries -------------------------------------------------------------
# Simple in-process rate limit (per client IP). It resets on restart and is per-instance, which is
# acceptable for a small deployment; use a shared store (e.g. Redis) if you scale out.
ENQUIRY_LIMIT, ENQUIRY_WINDOW = 5, 3600
_enquiry_hits: dict[str, deque] = defaultdict(deque)

def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    return forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")

@app.post("/api/enquiries", response_model=EnquiryAck, status_code=201)
def create_enquiry(payload: EnquiryCreate, request: Request, db: Session = Depends(get_db)):
    if payload.website:  # honeypot tripped: pretend success, store nothing
        return {"ok": True}
    ip, now = _client_ip(request), time.time()
    hits = _enquiry_hits[ip]
    while hits and now - hits[0] > ENQUIRY_WINDOW:
        hits.popleft()
    if len(hits) >= ENQUIRY_LIMIT:
        raise HTTPException(status_code=429, detail="Too many enquiries from this connection. Please try again later.")
    hits.append(now)
    db.add(Enquiry(name=payload.name, email=str(payload.email).lower(), company=payload.company, service=payload.service, message=payload.message.strip()))
    db.commit()
    return {"ok": True}

@app.get("/api/admin/enquiries", response_model=list[EnquiryOut])
def list_enquiries(limit: int = Query(default=100, ge=1, le=500), offset: int = Query(default=0, ge=0), _: str = Depends(require_admin), db: Session = Depends(get_db)):
    return list(db.scalars(select(Enquiry).order_by(Enquiry.created_at.desc()).limit(limit).offset(offset)).all())

@app.post("/api/registrations", response_model=RegistrationOut, status_code=201)
def create_registration(payload: RegistrationCreate, user_id: int = Depends(require_user), db: Session = Depends(get_db)):
    if payload.mode == "school" and (not payload.school or not payload.city):
        raise HTTPException(status_code=422, detail="School name and city are required for school registration.")

    # A PostgreSQL transaction-level advisory lock serializes school-capacity checks,
    # preventing concurrent requests from exceeding the 100-registration cap.
    try:
        if payload.mode == "school":
            if db.bind.dialect.name == "postgresql":
                db.execute(text("SELECT pg_advisory_xact_lock(8291042026)"))
            count = db.scalar(select(func.count()).select_from(Registration).where(Registration.mode == "school")) or 0
            if count >= 100:
                db.rollback()
                raise HTTPException(status_code=409, detail="School registration limit of 100 has been reached.")
        record = Registration(
            user_id=user_id,
            registration_code="RTF-" + secrets.token_hex(5).upper(),
            mode=payload.mode,
            name=payload.name,
            email=str(payload.email).lower(),
            phone=payload.phone,
            class_level=payload.class_level,
            school=payload.school if payload.mode == "school" else None,
            city=payload.city if payload.mode == "school" else None,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration could not be saved. Please try again.")

@app.get("/api/registrations/mine", response_model=list[RegistrationOut])
def my_registrations(user_id: int = Depends(require_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(Registration).where(Registration.user_id == user_id).order_by(Registration.created_at.desc())).all())

@app.post("/api/admin/login", response_model=LoginOut)
def admin_login(payload: AdminLogin):
    if not verify_admin(payload.username, payload.password):
        # Generic response avoids disclosing which field was incorrect.
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    return {"access_token": create_access_token(payload.username, "admin"), "expires_in": TOKEN_HOURS * 3600}

def filtered_query(db: Session, q: str | None, mode: str | None, class_level: str | None, start_date: str | None, end_date: str | None):
    stmt = select(Registration)
    if q:
        term = f"%{q.strip()}%"
        stmt = stmt.where(or_(Registration.name.ilike(term), Registration.email.ilike(term), Registration.school.ilike(term), Registration.city.ilike(term), Registration.registration_code.ilike(term)))
    if mode in ("individual", "school"):
        stmt = stmt.where(Registration.mode == mode)
    if class_level in ("9", "11"):
        stmt = stmt.where(Registration.class_level == class_level)
    if start_date:
        try:
            stmt = stmt.where(Registration.created_at >= datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid start_date. Use YYYY-MM-DD.")
    if end_date:
        try:
            stmt = stmt.where(Registration.created_at < datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc).replace(hour=23, minute=59, second=59))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid end_date. Use YYYY-MM-DD.")
    return stmt

@app.get("/api/admin/stats")
def admin_stats(_: str = Depends(require_admin), db: Session = Depends(get_db)):
    total = db.scalar(select(func.count()).select_from(Registration)) or 0
    individual = db.scalar(select(func.count()).select_from(Registration).where(Registration.mode == "individual")) or 0
    school = db.scalar(select(func.count()).select_from(Registration).where(Registration.mode == "school")) or 0
    class9 = db.scalar(select(func.count()).select_from(Registration).where(Registration.class_level == "9")) or 0
    class11 = db.scalar(select(func.count()).select_from(Registration).where(Registration.class_level == "11")) or 0
    return {"total": total, "individual": individual, "school": school, "school_limit": 100, "school_remaining": max(0, 100-school), "class_9": class9, "class_11": class11}

@app.get("/api/admin/registrations", response_model=list[RegistrationOut])
def list_registrations(
    q: str | None = None,
    mode: str | None = None,
    class_level: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    stmt = filtered_query(db, q, mode, class_level, start_date, end_date)
    return list(db.scalars(stmt.order_by(Registration.created_at.desc()).limit(limit).offset(offset)).all())

@app.get("/api/admin/export")
def export_registrations(
    format: str = Query(default="csv", pattern="^(csv|json)$"),
    q: str | None = None,
    mode: str | None = None,
    class_level: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    stmt = filtered_query(db, q, mode, class_level, start_date, end_date).order_by(Registration.created_at.desc())
    rows = list(db.scalars(stmt).all())
    data = [{
        "id": r.id, "registration_code": r.registration_code, "mode": r.mode,
        "name": r.name, "email": r.email, "phone": r.phone,
        "class_level": r.class_level, "school": r.school, "city": r.city,
        "created_at": r.created_at.isoformat()
    } for r in rows]
    if format == "json":
        import json
        body = json.dumps(data, ensure_ascii=False, indent=2)
        return Response(body, media_type="application/json", headers={"Content-Disposition": 'attachment; filename="road-to-future-registrations.json"'})
    output = io.StringIO()
    fields = list(data[0].keys()) if data else ["id","registration_code","mode","name","email","phone","class_level","school","city","created_at"]
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    writer.writerows(data)
    return Response(output.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": 'attachment; filename="road-to-future-registrations.csv"'})

@app.delete("/api/admin/registrations/{registration_id}", status_code=204)
def delete_registration(registration_id: int, _: str = Depends(require_admin), db: Session = Depends(get_db)):
    record = db.get(Registration, registration_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Registration not found.")
    db.delete(record)
    db.commit()
    return Response(status_code=204)
