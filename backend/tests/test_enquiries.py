from conftest import auth

VALID = {"name": "Ravi Kumar", "email": "ravi@example.com", "company": "Acme", "service": "Digital Experiences", "message": "We need a modern website for our business."}

def admin(client):
    return client.post("/api/admin/login", json={"username": "admin", "password": "admin-pass-for-tests"}).json()["access_token"]

def test_valid_enquiry_is_stored_and_visible_to_admin_only(client):
    assert client.post("/api/enquiries", json=VALID).status_code == 201
    assert client.get("/api/admin/enquiries").status_code == 401
    rows = client.get("/api/admin/enquiries", headers=auth(admin(client))).json()
    assert len(rows) == 1 and rows[0]["email"] == "ravi@example.com"

def test_validation_errors(client):
    assert client.post("/api/enquiries", json={**VALID, "email": "nope"}).status_code == 422
    assert client.post("/api/enquiries", json={**VALID, "message": "short"}).status_code == 422
    assert client.post("/api/enquiries", json={**VALID, "service": "Hacking"}).status_code == 422

def test_honeypot_is_silently_dropped(client):
    assert client.post("/api/enquiries", json={**VALID, "website": "http://spam.test"}).status_code == 201
    assert client.get("/api/admin/enquiries", headers=auth(admin(client))).json() == []

def test_rate_limit(client):
    codes = [client.post("/api/enquiries", json=VALID).status_code for _ in range(6)]
    assert codes[:5] == [201] * 5 and codes[5] == 429
