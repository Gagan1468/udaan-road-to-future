import os, sys
os.environ["DATABASE_URL"] = "sqlite:///./test_udaan.db"
os.environ["SESSION_SECRET"] = "test-secret-test-secret-test-secret-123"
os.environ["ADMIN_USERNAME"] = "admin"
os.environ["ADMIN_PASSWORD"] = "admin-pass-for-tests"
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from app.database import Base, engine
from app.main import app, _enquiry_hits

@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    _enquiry_hits.clear()
    with TestClient(app) as c:
        yield c

def signup(client, email="a@example.com", name="Asha Rao", password="correct-horse-1"):
    r = client.post("/api/auth/signup", json={"name": name, "email": email, "password": password})
    assert r.status_code == 201, r.text
    return r.json()["access_token"]

def auth(token):
    return {"Authorization": f"Bearer {token}"}
