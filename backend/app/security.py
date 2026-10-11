from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac
import hmac, os, base64
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db

ALGORITHM = "HS256"
TOKEN_HOURS = 8
bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = pbkdf2_hmac("sha256", password.encode(), salt, 310000)
    return "pbkdf2_sha256$310000$" + base64.urlsafe_b64encode(salt).decode() + "$" + base64.urlsafe_b64encode(digest).decode()

def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, rounds, salt_text, digest_text = encoded.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_text.encode())
        expected = base64.urlsafe_b64decode(digest_text.encode())
        actual = pbkdf2_hmac("sha256", password.encode(), salt, int(rounds))
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False

def verify_admin(username: str, password: str) -> bool:
    return hmac.compare_digest(username, settings.admin_username) and hmac.compare_digest(password, settings.admin_password)

def create_access_token(subject: str, token_type: str = "admin", expires_hours: int | None = None, token_version: int | None = None) -> str:
    # Admin tokens retain the shorter default lifetime. User sessions can opt into
    # a longer remember-me window while still having a bounded expiration.
    expires = datetime.now(timezone.utc) + timedelta(hours=expires_hours or TOKEN_HOURS)
    claims = {"sub": subject, "type": token_type, "exp": expires}
    if token_version is not None:
        claims["tv"] = token_version
    return jwt.encode(claims, settings.session_secret, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, settings.session_secret, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired. Please sign in again.")

def require_admin(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Admin login required.")
    payload = decode_token(credentials.credentials)
    subject = payload.get("sub")
    if payload.get("type") != "admin" or subject != settings.admin_username:
        raise HTTPException(status_code=401, detail="Admin login required.")
    return subject

def authenticate_user(credentials, db: Session):
    """Validate the bearer token AND the database state. Returns (user, claims).

    A token is only honoured while the account exists and its token_version matches,
    so deleted accounts, password changes and "sign out other sessions" take effect server-side.
    """
    from .models import User
    if credentials is None:
        raise HTTPException(status_code=401, detail="Please sign in first.")
    payload = decode_token(credentials.credentials)
    subject = payload.get("sub", "")
    if payload.get("type") != "user" or not str(subject).startswith("user:"):
        raise HTTPException(status_code=401, detail="Please sign in first.")
    try:
        user_id = int(str(subject).split(":", 1)[1])
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user session.")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Account not found. Please sign in again.")
    if int(payload.get("tv", 0)) != (user.token_version or 0):
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    return user, payload

def require_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> int:
    user, _ = authenticate_user(credentials, db)
    return user.id

def require_user_session(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)):
    return authenticate_user(credentials, db)
